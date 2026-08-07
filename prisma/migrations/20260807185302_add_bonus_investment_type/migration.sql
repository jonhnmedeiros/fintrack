-- AlterEnum: adiciona BONUS (bonificação em ações — recebidas sem custo,
-- distinto de compra) ao tipo de transação de investimento existente.
ALTER TYPE "InvTransactionType" ADD VALUE 'BONUS';
