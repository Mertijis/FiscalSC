import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CITY_PORTALS: Record<string, { baseUrl: string; slug: string; maxDays: number }> = {
  florianopolis: {
    baseUrl: "https://transparencia.e-publica.net/epublica-portal",
    slug: "florianopolis",
    maxDays: 15,
  },
  joinville: {
    baseUrl: "https://transparencia.joinville.sc.gov.br/epublica-portal",
    slug: "joinville",
    maxDays: 31,
  },
  itajai: {
    baseUrl: "https://portaltransparencia.itajai.sc.gov.br/epublica-portal",
    slug: "itajai",
    maxDays: 31,
  },
  chapeco: {
    baseUrl: "https://transparencia.e-publica.net/epublica-portal",
    slug: "chapeco",
    maxDays: 31,
  },
};

function isAllowedHost(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    const host = parsed.hostname.toLowerCase();
    return (
      host === "transparencia.e-publica.net" ||
      host === "epublica.joinville.sc.gov.br" ||
      host === "transparencia.joinville.sc.gov.br" ||
      host === "portaltransparencia.itajai.sc.gov.br" ||
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
  const cityIdParam = (searchParams.get("cityId") || "").toLowerCase();

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
    const docIdMatch = rawUrl.match(/\/o\/([^/]+)\/(\d+)/);
    const ociCitySlug = docIdMatch ? docIdMatch[1].toLowerCase() : null;
    const docId = docIdMatch ? docIdMatch[2] : null;

    if (docId) {
      const targetCity = CITY_PORTALS[cityIdParam] || (ociCitySlug ? CITY_PORTALS[ociCitySlug] : null) || CITY_PORTALS.florianopolis;
      const [mes = "01", ano = "2024"] = periodoParam.split("/");
      const ultimoDia = new Date(Number(ano) || 2024, Number(mes) || 1, 0).getDate();
      const diaFinal = Math.min(ultimoDia, targetCity.maxDays);
      const dataInicio = `01/${mes}/${ano}`;
      const dataFim = `${String(diaFinal).padStart(2, "0")}/${mes}/${ano}`;

      const freshApiRes = await fetch(
        `${targetCity.baseUrl}/rest/${targetCity.slug}/api/v1/licitacao?periodo_inicial=${dataInicio}&periodo_final=${dataFim}&inicio_registro=0&quantidade_registro=50`,
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
