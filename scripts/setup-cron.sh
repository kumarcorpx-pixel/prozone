#!/bin/bash
# Setup daily cron job for expiry notifications
# Run this once on VPS: bash /var/www/prozone/scripts/setup-cron.sh

CRON_SECRET="${CRON_SECRET:-default-cron-secret}"
DOMAIN="https://corporatepro.cloud"

# Add cron job to run expiry check daily at 8 AM Dubai time (4 AM UTC)
(crontab -l 2>/dev/null | grep -v "expiry-check"; echo "0 4 * * * curl -s -H 'Authorization: Bearer ${CRON_SECRET}' ${DOMAIN}/api/cron/expiry-check >> /var/log/prozone-cron.log 2>&1") | crontab -

# Add cron job to run invoice reminder weekly on Sunday at 9 AM Dubai (5 AM UTC)
(crontab -l 2>/dev/null | grep -v "invoice-reminder"; echo "0 5 * * 0 curl -s -H 'Authorization: Bearer ${CRON_SECRET}' ${DOMAIN}/api/cron/invoice-reminder >> /var/log/prozone-cron.log 2>&1") | crontab -

# Add cron job for daily database backup at 2 AM Dubai (10 PM UTC previous day)
(crontab -l 2>/dev/null | grep -v "cron/backup"; echo "0 22 * * * curl -s -H 'Authorization: Bearer ${CRON_SECRET}' ${DOMAIN}/api/cron/backup >> /var/log/prozone-cron.log 2>&1") | crontab -

echo "Cron jobs installed:"
crontab -l
echo ""
echo "Logs will be written to /var/log/prozone-cron.log"
