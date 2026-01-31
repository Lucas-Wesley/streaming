#!/bin/bash

# O nome da stream é passado como primeiro argumento pelo Nginx ($name)
STREAM_NAME=$1

# Comando FFmpeg para gerar 3 qualidades
# - Mid (720p)
# - Low (480p)
# - High (Source)
/usr/bin/ffmpeg -i rtmp://127.0.0.1:1935/live/$STREAM_NAME \
  -c:v libx264 -b:v 1500k \
  -vf "scale=-2:720" \
  -preset ultrafast -tune zerolatency -g 60 -sc_threshold 0 \
  -c:a aac -b:a 128k -ar 44100 \
  -f flv rtmp://127.0.0.1:1935/hls_transcoding/${STREAM_NAME}_mid \
  \
  -c:v libx264 -b:v 800k \
  -vf "scale=-2:480" \
  -preset ultrafast -tune zerolatency -g 60 -sc_threshold 0 \
  -c:a aac -b:a 64k  -ar 44100 \
  -f flv rtmp://127.0.0.1:1935/hls_transcoding/${STREAM_NAME}_low \
  \
  -c:v libx264 -b:v 4500k \
  -preset ultrafast -tune zerolatency -g 60 -sc_threshold 0 \
  -c:a aac -b:a 128k -ar 44100 \
  -f flv rtmp://127.0.0.1:1935/hls_transcoding/${STREAM_NAME}_src \
  2>>/tmp/ffmpeg.log

# ============================================================================
# DOCUMENTAÇÃO COMPLETA DO COMANDO FFMPEG
# ============================================================================
#
# Este script recebe um stream RTMP de entrada e gera 3 variantes de qualidade
# diferentes para streaming adaptativo (HLS). Cada saída é enviada para uma
# aplicação RTMP diferente no Nginx, que então gera os arquivos HLS.
#
# ----------------------------------------------------------------------------
# ESTRUTURA GERAL
# ----------------------------------------------------------------------------
# ffmpeg -i [ENTRADA] \
#   [OPÇÕES_SAÍDA_1] -f flv [DESTINO_1] \
#   [OPÇÕES_SAÍDA_2] -f flv [DESTINO_2] \
#   [OPÇÕES_SAÍDA_3] -f flv [DESTINO_3]
#
# ----------------------------------------------------------------------------
# ENTRADA
# ----------------------------------------------------------------------------
# -i rtmp://127.0.0.1:1935/live/$STREAM_NAME
#   -i           : Especifica o arquivo/stream de entrada
#   rtmp://...   : URL do stream que o OBS está enviando para o Nginx
#   $STREAM_NAME : Variável com o nome/chave da transmissão (ex: "lcuas")
#
# ----------------------------------------------------------------------------
# SAÍDA 1: MID (720p) - Qualidade Média
# ----------------------------------------------------------------------------
# -c:v libx264
#   -c:v      : Codec de vídeo
#   libx264   : Encoder H.264 (padrão da indústria para streaming)
#
# -b:v 1500k
#   -b:v      : Bitrate de vídeo
#   1500k     : 1500 kbps (1.5 Mbps) - qualidade média/alta
#
# -vf "scale=-2:720"
#   -vf       : Video filter (filtro de vídeo)
#   scale     : Redimensiona o vídeo
#   -2        : Largura calculada automaticamente mantendo aspect ratio
#   720       : Altura fixa em 720 pixels (HD)
#   Nota: -2 garante que a largura seja um número par (exigência do H.264)
#
# -preset ultrafast
#   -preset   : Define o equilíbrio entre velocidade e compressão
#   ultrafast : Mais rápido possível (consome menos CPU, arquivo maior)
#   Outras opções: superfast, veryfast, faster, fast, medium, slow, slower
#
# -tune zerolatency
#   -tune          : Otimização específica para o tipo de conteúdo
#   zerolatency    : Minimiza o delay para streaming ao vivo
#
# -g 60
#   -g    : GOP (Group of Pictures) size - intervalo entre keyframes
#   60    : 1 keyframe a cada 60 frames (com 60 fps = 1 keyframe/segundo)
#   Nota: Keyframes menores = melhor seek, mas arquivo maior
#
# -sc_threshold 0
#   -sc_threshold : Scene change threshold (detecção de mudança de cena)
#   0             : Desativa a inserção automática de keyframes em cortes
#   Mantém o GOP fixo, essencial para HLS funcionar corretamente
#
# -c:a aac
#   -c:a  : Codec de áudio
#   aac   : Advanced Audio Codec (padrão para HLS e web)
#
# -b:a 128k
#   -b:a  : Bitrate de áudio
#   128k  : 128 kbps (qualidade boa para música/voz)
#
# -ar 44100
#   -ar     : Audio rate (sample rate)
#   44100   : 44.1 kHz (qualidade CD)
#
# -f flv
#   -f   : Formato de saída
#   flv  : Flash Video (container usado pelo RTMP)
#
# rtmp://127.0.0.1:1935/hls_transcoding/${STREAM_NAME}_mid
#   Destino da saída: aplicação RTMP no Nginx que irá gerar HLS
#   O sufixo "_mid" identifica esta qualidade no HLS
#
# ----------------------------------------------------------------------------
# SAÍDA 2: LOW (480p) - Qualidade Baixa
# ----------------------------------------------------------------------------
# -c:v libx264 -b:v 800k
#   Mesmo codec, mas bitrate reduzido (800 kbps para economia de banda)
#
# -vf "scale=-2:480"
#   Altura reduzida para 480 pixels (SD - Standard Definition)
#
# -preset ultrafast -tune zerolatency -g 60 -sc_threshold 0
#   Mesmas otimizações da saída MID
#
# -c:a aac -b:a 64k -ar 44100
#   Áudio AAC, mas com bitrate reduzido (64 kbps) para economia
#
# -f flv rtmp://127.0.0.1:1935/hls_transcoding/${STREAM_NAME}_low
#   Destino com sufixo "_low"
#
# ----------------------------------------------------------------------------
# SAÍDA 3: SRC (Source) - Qualidade Alta/Original
# ----------------------------------------------------------------------------
# -c:v libx264 -b:v 4500k
#   Bitrate alto (4.5 Mbps) para manter a qualidade original
#
# Nota: NÃO há filtro "scale" aqui, mantém a resolução original do OBS
#
# -preset ultrafast -tune zerolatency -g 60 -sc_threshold 0
#   Mesmas otimizações
#
# -c:a aac -b:a 128k -ar 44100
#   Áudio com qualidade alta (128 kbps)
#
# -f flv rtmp://127.0.0.1:1935/hls_transcoding/${STREAM_NAME}_src
#   Destino com sufixo "_src" (source)
#
# ----------------------------------------------------------------------------
# REDIRECIONAMENTO DE ERROS
# ----------------------------------------------------------------------------
# 2>>/tmp/ffmpeg.log
#   2>>     : Redireciona stderr (erros) em modo append
#   /tmp/... : Salva logs no arquivo temporário dentro do container
#   Para visualizar: docker exec stream_server tail -f /tmp/ffmpeg.log
#
# ============================================================================
# FLUXO COMPLETO
# ============================================================================
# 1. OBS envia para: rtmp://localhost/live/lcuas
# 2. Nginx recebe e chama este script: /usr/local/bin/transcode.sh lcuas
# 3. FFmpeg lê de: rtmp://127.0.0.1:1935/live/lcuas
# 4. FFmpeg gera 3 streams:
#    - rtmp://127.0.0.1:1935/hls_transcoding/lcuas_mid (720p)
#    - rtmp://127.0.0.1:1935/hls_transcoding/lcuas_low (480p)
#    - rtmp://127.0.0.1:1935/hls_transcoding/lcuas_src (original)
# 5. Nginx (aplicação hls_transcoding) converte cada um para HLS
# 6. Player HLS escolhe a qualidade baseado na velocidade de internet
#
# ============================================================================
