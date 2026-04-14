import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from 'antd';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface GuideStep {
  selector: string;
  title: string;
  description: string;
}

interface GuideTourProps {
  steps: GuideStep[];
  onFinish?: () => void;
  storageKey?: string;
  autoStart?: boolean;
  open?: boolean;
  onClose?: () => void;
}

const GuideTour: React.FC<GuideTourProps> = ({
  steps,
  onFinish,
  storageKey = 'hr_guide_finished',
  autoStart = true,
  open,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (open) {
      startTour();
    }
  }, [open, startTour]);

  useEffect(() => {
    if (autoStart) {
      // 改为使用 sessionStorage，确保每次登录（新会话）都会触发
      const finished = sessionStorage.getItem(storageKey);
      if (!finished) {
        startTour();
      }
    }
  }, [autoStart, storageKey, startTour]);

  const updateRect = useCallback(() => {
    if (currentStep >= 0 && currentStep < steps.length) {
      const element = document.querySelector(steps[currentStep].selector);
      if (element) {
        // 自动滚动到元素
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    }
  }, [currentStep, steps]);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [updateRect]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    setIsVisible(false);
    setCurrentStep(-1);
    // 改为使用 sessionStorage
    sessionStorage.setItem(storageKey, 'true');
    onFinish?.();
    onClose?.();
  };

  const handleSkip = () => {
    handleFinish();
  };

  if (!isVisible || !targetRect) return null;

  const currentData = steps[currentStep];

  // 计算提示框位置
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 10001,
    left: targetRect.right + 20,
    top: targetRect.top + (targetRect.height / 2),
    transform: 'translateY(-50%)',
  };

  // 如果靠右太近，显示在左侧
  if (targetRect.right + 350 > window.innerWidth) {
    tooltipStyle.left = 'auto';
    tooltipStyle.right = (window.innerWidth - targetRect.left) + 20;
  }

  return createPortal(
    <div className="fixed inset-0 z-[10000] overflow-hidden pointer-events-none">
      {/* 遮罩层 - 使用 SVG 实现 spotlight 挖孔效果 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="guide-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={targetRect.left - 8}
              y={targetRect.top - 8}
              width={targetRect.width + 16}
              height={targetRect.height + 16}
              rx="8"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#guide-mask)"
        />
      </svg>

      {/* 高亮边框/光晕 */}
      <div
        className="absolute pointer-events-none transition-all duration-300 ease-in-out border-2 border-blue-400 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        style={{
          left: targetRect.left - 8,
          top: targetRect.top - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
        }}
      />

      {/* 提示卡片 */}
      <div
        className="fixed w-80 bg-white rounded-xl shadow-2xl p-5 pointer-events-auto transition-all duration-300 ease-in-out"
        style={tooltipStyle}
      >
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{currentData.title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {currentData.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-6">
          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">
            {currentStep + 1} / {steps.length}
          </span>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button 
                size="small" 
                onClick={handlePrev}
                className="flex items-center gap-1 border-gray-200"
              >
                <ChevronLeft size={14} /> 上一步
              </Button>
            )}
            <Button 
              type="primary" 
              size="small" 
              onClick={handleNext}
              className="flex items-center gap-1 bg-blue-600"
            >
              {currentStep === steps.length - 1 ? '完成' : '下一步'}
              {currentStep < steps.length - 1 && <ChevronRight size={14} />}
            </Button>
          </div>
        </div>

        {/* 小箭头指示器 */}
        <div 
          className={`absolute w-3 h-3 bg-white rotate-45 top-1/2 -translate-y-1/2 ${
            targetRect.right + 350 > window.innerWidth ? '-right-1.5' : '-left-1.5 border-l border-b border-white'
          }`}
          style={{ boxShadow: targetRect.right + 350 > window.innerWidth ? '2px -2px 5px rgba(0,0,0,0.05)' : '-2px 2px 5px rgba(0,0,0,0.05)' }}
        />
      </div>
    </div>,
    document.body
  );
};

export default GuideTour;
