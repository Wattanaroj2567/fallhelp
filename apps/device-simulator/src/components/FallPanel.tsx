import {
  BellAlertIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  HandRaisedIcon,
  ShieldExclamationIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import type { ComponentType, SVGProps } from "react";
import type { FallPhase, FallPhaseKind } from "../lib/fallPhase";
import { useI18n } from "../i18n/useI18n";
import CountdownRing from "./CountdownRing";
import Panel from "./Panel";
import StatusBadge from "./StatusBadge";
import { buttonDanger, buttonWarning } from "./buttons";
import { TONE_TEXT, type Tone } from "./tones";

interface FallPanelProps {
  phase: FallPhase;
  canSend: boolean;
  online: boolean;
  onSimulateFall: () => void;
  onCancel: () => void;
}

interface PhaseView {
  tone: Tone;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const PHASE_VIEW: Record<FallPhaseKind, PhaseView> = {
  idle: { tone: "ok", icon: CheckCircleIcon },
  suspected: { tone: "pending", icon: ExclamationTriangleIcon },
  confirmed: { tone: "danger", icon: BellAlertIcon },
  cancelled: { tone: "muted", icon: XCircleIcon },
};

export default function FallPanel({
  phase,
  canSend,
  online,
  onSimulateFall,
  onCancel,
}: FallPanelProps) {
  const { t } = useI18n();
  const view = PHASE_VIEW[phase.kind];
  const text = t.fall.phases[phase.kind];
  const PhaseIcon = view.icon;
  const seconds = Math.ceil(phase.remainingMs / 1000);
  const fraction = phase.totalMs > 0 ? phase.remainingMs / phase.totalMs : 1;

  return (
    <Panel
      title={t.fall.title}
      subtitle={t.fall.subtitle}
      icon={ShieldExclamationIcon}
      iconTone={view.tone}
      aside={<StatusBadge tone={view.tone} label={text.title} pulse={phase.kind === "suspected"} />}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-4">
        <CountdownRing
          fraction={fraction}
          tone={view.tone}
          value={
            phase.kind === "idle" ? <CheckCircleIcon className="h-28 w-28" aria-hidden /> : seconds
          }
          caption={text.caption}
        />
        <div className="text-center">
          <p
            className={`flex items-center justify-center gap-2 text-2xl font-medium ${TONE_TEXT[view.tone]}`}
          >
            <PhaseIcon className="h-7 w-7" aria-hidden />
            {text.title}
          </p>
          <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
            {phase.kind === "idle" && !online ? t.fall.goOnlineFirst : text.detail}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          className={`${buttonDanger} py-5 text-xl`}
          disabled={!canSend || !online || phase.kind !== "idle"}
          onClick={onSimulateFall}
        >
          <ExclamationTriangleIcon className="h-6 w-6" aria-hidden />
          {t.fall.simulate}
        </button>
        <button
          className={`${buttonWarning} py-5 text-xl`}
          disabled={!canSend || phase.kind !== "suspected"}
          onClick={onCancel}
        >
          <HandRaisedIcon className="h-6 w-6" aria-hidden />
          {t.fall.cancel}
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">{t.fall.footnote}</p>
    </Panel>
  );
}
