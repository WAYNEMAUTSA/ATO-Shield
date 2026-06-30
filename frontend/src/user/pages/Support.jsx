import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How do I reset my password?",
    answer: "Go to Profile > Edit profile, then select 'Change password' and follow the steps to set a new one.",
  },
  {
    question: "How long do transfers take?",
    answer: "Most transfers are instant. In rare cases involving external banks, it can take up to 1 business day.",
  },
  {
    question: "How do I update my phone number?",
    answer: "Visit Profile > Edit profile to update your contact details at any time.",
  },
  {
    question: "Is my account secure?",
    answer: "Yes. We use encryption for all transactions and never store your password in plain text.",
  },
  {
    question: "How do I contact support directly?",
    answer: "Email us at support@example.com and we'll respond within 24 hours.",
  },
];

function Support() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => setOpenIndex(openIndex === index ? null : index);

  return (
    <div className="h-full w-full flex flex-col bg-white px-6 py-8">
      <button onClick={() => navigate("/more")} className="text-slate-500 mb-6">
        <ArrowLeft size={20} />
      </button>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">Help & support</h2>
      <p className="text-sm text-slate-400 mb-6">Common questions, answered.</p>

      <div className="flex flex-col gap-1">
        {faqs.map((faq, index) => (
          <div key={faq.question} className="border-b border-slate-100">
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between py-3 text-left"
            >
              <span className="text-sm font-medium text-slate-800">{faq.question}</span>
              <ChevronDown
                size={16}
                className={`text-slate-400 shrink-0 transition-transform ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>
            {openIndex === index && (
              <p className="text-sm text-slate-500 pb-3 pr-6">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Support;