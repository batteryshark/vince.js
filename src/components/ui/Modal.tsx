interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50"
        style={{backgroundColor: 'rgba(0, 0, 0, 0.85)'}}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div 
          className="rounded-xl p-0 w-full max-w-lg max-h-[90vh] mx-auto shadow-2xl border-2 border-gray-600 relative pointer-events-auto overflow-hidden flex flex-col"
          style={{backgroundColor: '#1f2937'}}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="rounded-t-xl px-6 py-4 border-b-2 border-gray-600" style={{backgroundColor: '#1f2937'}}>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-300 hover:text-white text-2xl leading-none p-1 hover:bg-gray-700 rounded-full transition-colors"
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="rounded-b-xl px-6 py-4 overflow-y-auto flex-1" style={{backgroundColor: '#1f2937'}}>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}