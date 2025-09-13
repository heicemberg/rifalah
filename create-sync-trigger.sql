-- Función y trigger para sincronizar tickets cuando se confirma una compra
-- Ejecutar este SQL en el editor de Supabase

-- 1. Crear función que actualiza tickets cuando una compra se confirma
CREATE OR REPLACE FUNCTION sync_tickets_on_purchase_confirm()
RETURNS TRIGGER AS $$
DECLARE
  tickets_needed INTEGER;
  available_tickets INTEGER[];
BEGIN
  -- Solo procesar si el status cambió a 'confirmada'
  IF NEW.status = 'confirmada' AND (OLD.status IS NULL OR OLD.status != 'confirmada') THEN
    
    -- Calcular cuántos tickets necesita esta compra
    IF NEW.total_amount > 0 AND NEW.unit_price > 0 THEN
      tickets_needed := ROUND(NEW.total_amount / NEW.unit_price);
      
      -- Obtener tickets disponibles
      SELECT ARRAY_AGG(number ORDER BY number)
      INTO available_tickets
      FROM (
        SELECT number 
        FROM tickets 
        WHERE status = 'disponible'
        ORDER BY number
        LIMIT tickets_needed
      ) t;
      
      -- Si hay suficientes tickets disponibles, marcarlos como vendidos
      IF array_length(available_tickets, 1) >= tickets_needed THEN
        UPDATE tickets 
        SET status = 'vendido'
        WHERE number = ANY(available_tickets);
        
        -- Log para debugging (opcional)
        RAISE NOTICE 'Marcados % tickets como vendidos para compra %', 
                     array_length(available_tickets, 1), NEW.id;
      ELSE
        RAISE WARNING 'No hay suficientes tickets disponibles. Necesarios: %, Disponibles: %', 
                      tickets_needed, COALESCE(array_length(available_tickets, 1), 0);
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Crear trigger que ejecuta la función cuando se actualiza una compra
DROP TRIGGER IF EXISTS sync_tickets_on_purchase_update ON purchases;

CREATE TRIGGER sync_tickets_on_purchase_update
AFTER INSERT OR UPDATE ON purchases
FOR EACH ROW
EXECUTE FUNCTION sync_tickets_on_purchase_confirm();

-- 3. Crear función para verificar sincronización (opcional, para debugging)
CREATE OR REPLACE FUNCTION check_sync_status()
RETURNS TABLE(
  purchases_confirmed INTEGER,
  tickets_calculated INTEGER,
  tickets_marked_sold INTEGER,
  sync_difference INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM purchases WHERE status = 'confirmada')::INTEGER as purchases_confirmed,
    (SELECT COALESCE(SUM(ROUND(total_amount / unit_price)), 0) 
     FROM purchases 
     WHERE status = 'confirmada' 
     AND total_amount > 0 
     AND unit_price > 0)::INTEGER as tickets_calculated,
    (SELECT COUNT(*) FROM tickets WHERE status = 'vendido')::INTEGER as tickets_marked_sold,
    ((SELECT COALESCE(SUM(ROUND(total_amount / unit_price)), 0) 
      FROM purchases 
      WHERE status = 'confirmada' 
      AND total_amount > 0 
      AND unit_price > 0) - 
     (SELECT COUNT(*) FROM tickets WHERE status = 'vendido'))::INTEGER as sync_difference;
END;
$$ LANGUAGE plpgsql;

-- Para verificar el estado de sincronización, ejecutar:
-- SELECT * FROM check_sync_status();