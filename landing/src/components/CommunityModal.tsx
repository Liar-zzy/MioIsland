import { motion, AnimatePresence } from "motion/react"
import { X, Users, User, Copy, Check } from "lucide-react"
import { useEffect, useState } from "react"
import { useI18n } from "../lib/i18n"

interface Props {
  open: boolean
  onClose: () => void
}

type Tab = "group" | "personal"

const WECHAT_ID = "A115939"

export default function CommunityModal({ open, onClose }: Props) {
  const { t } = useI18n()
  const [tab, setTab] = useState<Tab>("group")
  const [copied, setCopied] = useState(false)

  // ESC key closes modal
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  // Reset to group tab when modal opens
  useEffect(() => {
    if (open) {
      setTab("group")
      setCopied(false)
    }
  }, [open])

  const copyWechatId = async () => {
    try {
      await navigator.clipboard.writeText(WECHAT_ID)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
            className="relative max-w-md w-full rounded-3xl overflow-hidden"
            style={{
              background: "rgba(20, 20, 32, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 30px 90px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.04) inset",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] transition-all z-10"
              aria-label={t("community.close")}
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="pt-8 pb-4 px-6 text-center">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-text-primary">
                {t("community.title")}
              </h3>
              <p className="text-xs sm:text-sm text-text-muted mt-2 leading-relaxed">
                {t("community.subtitle")}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="px-6 pb-4">
              <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.04]">
                <button
                  onClick={() => setTab("group")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    tab === "group"
                      ? "bg-white/[0.08] text-text-primary shadow-sm"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <Users size={13} />
                  {t("community.tabGroup")}
                </button>
                <button
                  onClick={() => setTab("personal")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    tab === "personal"
                      ? "bg-white/[0.08] text-text-primary shadow-sm"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <User size={13} />
                  {t("community.tabPersonal")}
                </button>
              </div>
            </div>

            {/* QR Code content */}
            <div className="px-6 pb-6">
              <AnimatePresence mode="wait">
                {tab === "group" ? (
                  <motion.div
                    key="group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative rounded-2xl overflow-hidden bg-white p-3 mx-auto max-w-[240px]">
                      <img
                        src={`${import.meta.env.BASE_URL}wechat-qr.jpg`}
                        alt="WeChat Group QR Code"
                        className="w-full h-auto block"
                      />
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-text-muted text-center leading-relaxed">
                        {t("community.groupNote")}
                      </p>
                      <p className="text-[10px] text-text-muted/60 text-center leading-relaxed mt-1.5">
                        {t("community.groupExpiry")}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="personal"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative rounded-2xl overflow-hidden bg-white p-3 mx-auto max-w-[240px]">
                      <img
                        src={`${import.meta.env.BASE_URL}wechat-personal.jpg`}
                        alt="Developer WeChat QR Code"
                        className="w-full h-auto block"
                      />
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-text-muted text-center leading-relaxed">
                        {t("community.personalNote")}
                      </p>
                      {/* WeChat ID with copy */}
                      <button
                        onClick={copyWechatId}
                        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all group cursor-pointer"
                      >
                        <span className="text-xs text-text-muted">{t("community.wechatId")}</span>
                        <span className="font-mono text-sm font-semibold text-text-primary tracking-wider">{WECHAT_ID}</span>
                        {copied ? (
                          <Check size={13} className="text-green" />
                        ) : (
                          <Copy size={13} className="text-text-muted group-hover:text-text-primary transition-colors" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Gradient border glow */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(74,222,128,0.08) 0%, transparent 50%, rgba(124,58,237,0.08) 100%)",
                mixBlendMode: "overlay",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
