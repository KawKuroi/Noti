export const dynamic = 'force-dynamic'

interface Props {
  children: React.ReactNode
}

export default function LayoutAuth({ children }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Noti</h1>
          <p className="text-gray-500 mt-1 text-sm">Recordatorios para todo lo que importa</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
