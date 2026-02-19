import { X } from "lucide-react";

const ModalWrapper = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div
        className={`bg-white w-full ${maxWidth} rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 relative animate-in slide-in-from-bottom sm:zoom-in duration-300 max-h-[92vh] flex flex-col`}
      >
        
        <div className="flex justify-between items-center mb-6 sm:mb-8 shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 bg-gray-50 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

   
        <div className="overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalWrapper;