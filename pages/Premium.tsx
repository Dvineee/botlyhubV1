
import React from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { subscriptionPlans } from '../data';

const Premium = () => {
  const navigate = useNavigate();

  // Get current plan from local storage (mock)
  const currentPlanId = localStorage.getItem('userPlan') || 'plan_starter';

  const handleSelectPlan = (planId: string) => {
    if (planId === currentPlanId) return;
    
    // If free plan, just set it
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (plan && plan.price === 0) {
        localStorage.setItem('userPlan', planId);
        navigate('/settings'); // Go back to profile
    } else {
        // Go to payment for paid plans
        navigate(`/payment/${planId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 pt-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-900 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Premium Paketler</h1>
      </div>

      {/* Hero */}
      <div className="text-center mb-10">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
              Limitleri Kaldırın
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
              Daha düşük komisyon oranları ve özel özelliklerle gelirinizi artırın.
          </p>
      </div>

      {/* Plans Grid */}
      <div className="space-y-6">
          {subscriptionPlans.map((plan) => {
              const isCurrent = currentPlanId === plan.id;
              const Icon = plan.icon;

              // Color mapping for dynamic styles
              let borderColor = 'border-slate-800';
              let shadowColor = '';
              let btnColor = 'bg-slate-800 text-white';
              let iconColor = 'text-slate-400';
              
              if (plan.color === 'blue') {
                  borderColor = 'border-blue-500/50';
                  shadowColor = 'shadow-[0_0_20px_rgba(59,130,246,0.15)]';
                  btnColor = 'bg-blue-600 hover:bg-blue-500 text-white';
                  iconColor = 'text-blue-400';
              } else if (plan.color === 'yellow') {
                  borderColor = 'border-yellow-500/50';
                  shadowColor = 'shadow-[0_0_20px_rgba(234,179,8,0.15)]';
                  btnColor = 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white';
                  iconColor = 'text-yellow-400';
              }

              return (
                  <div 
                    key={plan.id} 
                    className={`relative bg-slate-900 rounded-2xl p-6 border ${borderColor} ${shadowColor} transition-transform duration-300 ${plan.isPopular ? 'scale-[1.02]' : ''}`}
                  >
                      {plan.isPopular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                              EN POPÜLER
                          </div>
                      )}

                      <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 ${iconColor}`}>
                              <Icon size={24} />
                          </div>
                          <div className="text-right">
                              <div className="flex items-end justify-end gap-1">
                                  <span className="text-2xl font-bold text-white">₺{plan.price}</span>
                                  <span className="text-xs text-slate-500 mb-1">/ay</span>
                              </div>
                              <p className="text-[10px] text-slate-400">{plan.billingPeriod} faturalandırılır</p>
                          </div>
                      </div>

                      <h3 className={`text-lg font-bold mb-2 ${plan.color === 'yellow' ? 'text-yellow-400' : 'text-white'}`}>
                          {plan.name}
                      </h3>
                      <p className="text-xs text-slate-400 mb-6 min-h-[40px]">
                          {plan.description}
                      </p>

                      <div className="space-y-3 mb-8">
                          {plan.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                  <div className={`p-0.5 rounded-full ${plan.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                    <Check size={12} strokeWidth={3} />
                                  </div>
                                  <span className="text-sm text-slate-300">{feature}</span>
                              </div>
                          ))}
                      </div>

                      <button 
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={isCurrent}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 ${
                            isCurrent 
                            ? 'bg-slate-800 text-slate-500 cursor-default' 
                            : btnColor
                        }`}
                      >
                          {isCurrent ? 'Mevcut Plan' : (plan.price === 0 ? 'Ücretsiz Başla' : 'Planı Seç')}
                      </button>
                  </div>
              );
          })}
      </div>
    </div>
  );
};

export default Premium;
