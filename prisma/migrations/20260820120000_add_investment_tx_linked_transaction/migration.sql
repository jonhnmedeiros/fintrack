-- Vincula opcionalmente uma InvestmentTransaction à Transaction (débito/
-- crédito na conta) lançada automaticamente ao registrar o movimento.
ALTER TABLE "InvestmentTransaction" ADD COLUMN "linkedTransactionId" TEXT;

CREATE UNIQUE INDEX "InvestmentTransaction_linkedTransactionId_key"
  ON "InvestmentTransaction"("linkedTransactionId");

ALTER TABLE "InvestmentTransaction"
  ADD CONSTRAINT "InvestmentTransaction_linkedTransactionId_fkey"
  FOREIGN KEY ("linkedTransactionId") REFERENCES "Transaction"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
