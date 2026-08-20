-- Vincula as parcelas de uma mesma compra parcelada no cartão, permitindo
-- editar descrição/categoria/cartão de uma vez em todas elas. Coluna aditiva
-- e nullable: transações existentes (inclusive parcelas já criadas antes
-- desta feature) ficam com NULL e continuam editáveis só individualmente.
ALTER TABLE "Transaction" ADD COLUMN "installmentGroupId" TEXT;
