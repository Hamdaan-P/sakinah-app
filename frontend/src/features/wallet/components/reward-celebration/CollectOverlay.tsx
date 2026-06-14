/**
 * CollectOverlay — green "added to wallet" badge that appears during the
 * collect phase of RewardCelebration.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from '@phosphor-icons/react';

interface Props {
  show: boolean;
  newBalance: number;
}

export function CollectOverlay({ show, newBalance }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute flex flex-col items-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', damping: 12 }}
        >
          <motion.div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, #22C55E, #16A34A)',
              boxShadow: '0 0 40px rgba(34,197,94,0.4)',
            }}
            animate={{ scale: [0.8, 1.1, 1] }}
            transition={{ duration: 0.5 }}
          >
            <CheckCircle size={40} weight="fill" className="text-white" />
          </motion.div>
          <motion.p
            className="text-emerald-400 text-lg font-bold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Added to Wallet!
          </motion.p>
          <motion.p
            className="text-[#7A7363] text-sm mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {newBalance.toLocaleString()} DNZ total
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
