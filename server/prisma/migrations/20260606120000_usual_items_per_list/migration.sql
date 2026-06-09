-- Drop household-scoped usual_items and recreate as list-scoped (fresh start)
DROP TABLE "usual_items";

CREATE TABLE "usual_items" (
    "list_id" TEXT NOT NULL,
    "catalog_item_id" TEXT NOT NULL,
    "is_manual" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "usual_items_pkey" PRIMARY KEY ("list_id","catalog_item_id")
);

ALTER TABLE "usual_items" ADD CONSTRAINT "usual_items_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "usual_items" ADD CONSTRAINT "usual_items_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "catalog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
