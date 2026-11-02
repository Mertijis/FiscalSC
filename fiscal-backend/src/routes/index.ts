import { Router } from 'express';
import {
  handleCityQuery,
  handleDirectQuery,
  handleAggregateQuery,
  handleDashboardQuery,
} from '../controllers/queryController';

const router = Router();

// Endpoint de enfileiramento (WebSocket / BullMQ) ou REST direto
router.post('/query', handleCityQuery);

// Endpoint de consulta direta REST (com verificação e preenchimento de cache)
router.get('/query', handleDirectQuery);

// Endpoint de agregação segura (Trimestre / Período consolidado)
router.post('/aggregate', handleAggregateQuery);

// Endpoint BFF Agregador Municipal (Dashboard Consolidada Unificada)
router.get('/dashboard/:cityId', handleDashboardQuery);
router.get('/dashboard', handleDashboardQuery);

export default router;
