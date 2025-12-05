#!/bin/bash

# ============================================
# FallHelp Mobile App - Log Monitoring
# ============================================

LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/app-$(date +%Y%m%d_%H%M%S).log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

echo "📝 Monitoring FallHelp Mobile App"
echo "=================================="
echo "Logging to: $LOG_FILE"
echo ""
echo "Starting Expo dev server..."
echo "Press Ctrl+C to stop"
echo ""

# Start Expo and pipe output to both console and log file
npx expo start 2>&1 | tee -a "$LOG_FILE"

echo ""
echo "=================================="
echo "✅ Log saved to: $LOG_FILE"
echo ""

# Print summary
echo "📊 Log Summary:"
echo "--------------"
echo "Total lines: $(wc -l < "$LOG_FILE")"
echo "Errors: $(grep -c -i "error\|ERROR" "$LOG_FILE" || echo 0)"
echo "Warnings: $(grep -c -i "warn\|WARN" "$LOG_FILE" || echo 0)"
echo "Info messages: $(grep -c -i "INFO" "$LOG_FILE" || echo 0)"
echo ""
echo "Last 20 lines:"
echo "--------------"
tail -20 "$LOG_FILE"
