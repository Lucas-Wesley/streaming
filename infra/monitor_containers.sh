#!/bin/sh

# Script de Monitoramento de Containers (POSIX compatible)
# Coleta estatísticas do Docker a cada 10 segundos

LOG_DIR="/logs"
INTERVAL=10  # segundos entre cada coleta

# Aguarda os containers principais subirem
echo "⏳ Aguardando containers subirem..."
sleep 5

echo "🔍 Iniciando monitoramento de containers..."
echo "📊 Logs serão salvos em: $LOG_DIR"
echo "⏱️  Intervalo de coleta: ${INTERVAL}s"
echo ""

# Lista de containers a monitorar (separados por espaço)
CONTAINERS="stream_server docker-backend-1 docker-db-1"

# Cria arquivos CSV com cabeçalho
for container in $CONTAINERS; do
    log_file="$LOG_DIR/${container}.csv"
    echo "timestamp,cpu_percent,mem_usage,mem_limit,mem_percent,net_io,block_io" > "$log_file"
    echo "✅ Criado: $log_file"
done

echo ""
echo "▶️  Monitoramento ativo."
echo ""

# Loop infinito de coleta
while true; do
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    for container in $CONTAINERS; do
        # Verifica se o container está rodando
        if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
            # Coleta stats do container específico
            stats=$(docker stats --no-stream --format "{{.CPUPerc}},{{.MemUsage}},{{.MemPerc}},{{.NetIO}},{{.BlockIO}}" "$container")
            
            # Separa mem_usage e mem_limit
            mem_usage=$(echo "$stats" | cut -d',' -f2 | awk '{print $1}')
            mem_limit=$(echo "$stats" | cut -d',' -f2 | awk '{print $3}')
            cpu=$(echo "$stats" | cut -d',' -f1)
            mem_percent=$(echo "$stats" | cut -d',' -f3)
            net_io=$(echo "$stats" | cut -d',' -f4)
            block_io=$(echo "$stats" | cut -d',' -f5)
            
            # Salva no arquivo CSV
            log_file="$LOG_DIR/${container}.csv"
            echo "$timestamp,$cpu,$mem_usage,$mem_limit,$mem_percent,$net_io,$block_io" >> "$log_file"
            
            echo "[$(date '+%H:%M:%S')] $container: CPU=$cpu MEM=$mem_usage/$mem_limit ($mem_percent)"
        fi
    done
    
    echo "---"
    sleep "$INTERVAL"
done
