-- Categorias padrão (despesa/receita) aplicadas automaticamente aos
-- lançamentos de conta gerados a partir de transações de investimento.
ALTER TABLE "User" ADD COLUMN "investExpenseCategoryId" TEXT;
ALTER TABLE "User" ADD COLUMN "investIncomeCategoryId" TEXT;

ALTER TABLE "User"
  ADD CONSTRAINT "User_investExpenseCategoryId_fkey"
  FOREIGN KEY ("investExpenseCategoryId") REFERENCES "Category"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "User"
  ADD CONSTRAINT "User_investIncomeCategoryId_fkey"
  FOREIGN KEY ("investIncomeCategoryId") REFERENCES "Category"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
