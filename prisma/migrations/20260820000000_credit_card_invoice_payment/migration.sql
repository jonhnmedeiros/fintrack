-- Vincula compras no cartão de crédito ao débito único gerado ao "pagar a
-- fatura" (uma transação de pagamento pode quitar várias compras).
ALTER TABLE "Transaction" ADD COLUMN "invoicePaymentId" TEXT;

ALTER TABLE "Transaction"
  ADD CONSTRAINT "Transaction_invoicePaymentId_fkey"
  FOREIGN KEY ("invoicePaymentId") REFERENCES "Transaction"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
