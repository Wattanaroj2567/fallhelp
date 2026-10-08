import {
  ClockIcon,
  PowerIcon,
  SignalIcon,
  SignalSlashIcon,
  WifiIcon,
} from "@heroicons/react/24/outline";
import { useI18n } from "../i18n/useI18n";
import Panel from "./Panel";
import StatusBadge from "./StatusBadge";
import { buttonPrimary, buttonSecondary } from "./buttons";

interface DevicePanelProps {
  online: boolean;
  canSend: boolean;
  lastStatusAt: number | null;
  onOnline: () => void;
  onOffline: () => void;
}

export default function DevicePanel({
  online,
  canSend,
  lastStatusAt,
  onOnline,
  onOffline,
}: DevicePanelProps) {
  const { t } = useI18n();
  const StateIcon = online ? SignalIcon : SignalSlashIcon;
  const stateLabel = online ? t.device.online : t.device.offline;

  return (
    <Panel
      title={t.device.title}
      subtitle={t.device.subtitle}
      icon={SignalIcon}
      iconTone={online ? "ok" : "muted"}
      aside={<StatusBadge tone={online ? "ok" : "muted"} label={stateLabel} pulse={online} />}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6">
        <div
          className={`flex h-36 w-36 items-center justify-center rounded-full ring-8 transition duration-500 ${
            online
              ? "bg-green-50 text-green-600 ring-green-100 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20"
              : "bg-gray-50 text-gray-400 ring-gray-100 dark:bg-gray-700/50 dark:text-gray-500 dark:text-gray-400 dark:ring-gray-700"
          }`}
        >
          <StateIcon className="h-16 w-16" aria-hidden />
        </div>
        <p
          className={`text-3xl font-semibold ${online ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500 dark:text-gray-400"}`}
        >
          {stateLabel}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          className={`${buttonPrimary} py-3`}
          disabled={!canSend || online}
          onClick={onOnline}
        >
          <SignalIcon className="h-5 w-5" aria-hidden />
          {t.device.goOnline}
        </button>
        <button
          className={`${buttonSecondary} py-3`}
          disabled={!canSend || !online}
          onClick={onOffline}
        >
          <PowerIcon className="h-5 w-5" aria-hidden />
          {t.device.goOffline}
        </button>
      </div>

      <dl className="mt-6 divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700 text-sm">
        <div className="flex items-center justify-between px-4 py-2.5">
          <dt className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <WifiIcon className="h-4 w-4" aria-hidden />
            {t.device.wifi}
          </dt>
          <dd className="text-gray-900 dark:text-gray-100">FallHelp-Demo · −55 dBm</dd>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5">
          <dt className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <SignalIcon className="h-4 w-4" aria-hidden />
            {t.device.heartbeat}
          </dt>
          <dd className="text-gray-900 dark:text-gray-100">
            {online ? t.device.every5s : t.device.stopped}
          </dd>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5">
          <dt className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <ClockIcon className="h-4 w-4" aria-hidden />
            {t.device.lastStatus}
          </dt>
          <dd className="text-gray-900 dark:text-gray-100 tabular-nums">
            {lastStatusAt ? new Date(lastStatusAt).toLocaleTimeString(t.locale) : "—"}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">{t.device.offlineNote}</p>
    </Panel>
  );
}
