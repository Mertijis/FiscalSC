import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function isAllowedHost(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    const host = parsed.hostname.toLowerCase();
    return (
      host === "transparencia.e-publica.net" ||
      host.endsWith(".oraclecloud.com") ||
      host.endsWith(".customer-oci.com")
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");
  const filenameParam = searchParams.get("filename") || "documento";
  const periodoParam = searchParams.get("periodo") || "01/2024";

  if (!rawUrl) {
    return NextResponse.json({ error: "Parâmetro url é obrigatório" }, { status: 400 });
  }

  if (!isAllowedHost(rawUrl)) {
    return NextResponse.json(
      { error: "Domínio de download não autorizado pelo proxy de segurança" },
      { status: 403 }
    );
  }

  // Remove caracteres especiais para o nome do arquivo baixado
  const sanitized = filenameParam
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_\- ]/g, "_")
    .trim();

  const cleanFilename = sanitized.toLowerCase().endsWith(".pdf")
    ? sanitized
    : `${sanitized}.pdf`;

  try {
    // 1. Tenta baixar diretamente a URL fornecida
    const directRes = await fetch(rawUrl, {
      method: "GET",
      headers: {
        "User-Agent": "FiscalSC-DownloadProxy/2.0",
      },
    });

    if (directRes.ok && directRes.body) {
      return new Response(directRes.body, {
        status: 200,
        headers: {
          "Content-Type": directRes.headers.get("content-type") || "application/pdf",
          "Content-Disposition": `attachment; filename="${cleanFilename}"`,
          "Content-Length": directRes.headers.get("content-length") || "",
        },
      });
    }

    // 2. Se retornou 404 (token OCI expirado), tenta obter link fresco da API da prefeitura usando o período selecionado
    const docIdMatch = rawUrl.match(/\/o\/[^/]+\/(\d+)/);
    const docId = docIdMatch ? docIdMatch[1] : null;

    if (docId) {
      const [mes = "01", ano = "2024"] = periodoParam.split("/");
      const dataInicio = `01/${mes}/${ano}`;
      const dataFim = `15/${mes}/${ano}`;

      const freshApiRes = await fetch(
        `https://transparencia.e-publica.net/epublica-portal/rest/florianopolis/api/v1/licitacao?periodo_inicial=${dataInicio}&periodo_final=${dataFim}&inicio_registro=0&quantidade_registro=50`,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": "FiscalSC-DownloadProxy/2.0",
          },
        }
      );

      if (freshApiRes.ok) {
        const freshData = await freshApiRes.json();
        const registros = Array.isArray(freshData?.registros) ? freshData.registros : [];

        for (const item of registros) {
          const listTextos = item.registro?.listTextos || item.listTextos || [];
          for (const doc of listTextos) {
            if (doc.link && doc.link.includes(`/${docId}`) && isAllowedHost(doc.link)) {
              const freshFetch = await fetch(doc.link);
              if (freshFetch.ok && freshFetch.body) {
                return new Response(freshFetch.body, {
                  status: 200,
                  headers: {
                    "Content-Type": freshFetch.headers.get("content-type") || "application/pdf",
                    "Content-Disposition": `attachment; filename="${cleanFilename}"`,
                    "Content-Length": freshFetch.headers.get("content-length") || "",
                  },
                });
              }
            }
          }
        }
      }
    }

    // 3. Fallback: redireciona para a URL original
    return NextResponse.redirect(rawUrl);
  } catch (err: unknown) {
    console.error("[Download Proxy Error]", err);
    return NextResponse.redirect(rawUrl);
  }
}
