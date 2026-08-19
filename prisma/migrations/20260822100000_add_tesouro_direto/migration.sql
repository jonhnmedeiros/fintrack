-- Adiciona suporte a Tesouro Direto: novo tipo de ativo TESOURO e novo tipo
-- de taxa SELIC_PLUS (spread aditivo sobre a Selic, usado pelo Tesouro
-- Selic — análogo ao CDI_PERCENT do CDB, porém aditivo em vez de
-- multiplicativo, podendo ser negativo em caso de deságio).
ALTER TYPE "AssetType" ADD VALUE 'TESOURO';
ALTER TYPE "FixedIncomeRateType" ADD VALUE 'SELIC_PLUS';
