import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkle } from '@phosphor-icons/react';
import { CreateListingForm } from '../components/CreateListingForm';
import { DinarzInlineBalance } from '../components/DinarzInlineBalance';

export function SoukCreateListingPage() {
  return (
    <div className="min-h-screen pb-16 max-w-3xl mx-auto">
      <div className="px-4 pt-5 pb-3 flex items-center gap-3">
        <Link
          to="/souk"
          className="p-2 rounded-lg bg-[#2C3C55] border border-[rgba(215,181,106,0.2)]"
        >
          <ArrowLeft size={18} className="text-[#EBDCB8]" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[#EBDCB8]">New listing</h1>
          <p className="text-[#A7B1C0] text-xs">Share something beneficial with the community</p>
        </div>
        <DinarzInlineBalance />
      </div>

      <div className="px-4 mb-4">
        <div className="p-3 rounded-xl bg-[#D7B56A]/8 border border-[#D7B56A]/25 flex items-start gap-2">
          <Sparkle size={16} className="text-[#D7B56A] mt-0.5 shrink-0" weight="fill" />
          <p className="text-[#D5DDEA] text-xs leading-relaxed">
            Listings are screened for halal-aligned content. Items in prohibited categories (alcohol, gambling, riba-based, adult content, weapons) will be removed automatically.
          </p>
        </div>
      </div>

      <div className="px-4">
        <CreateListingForm />
      </div>
    </div>
  );
}
