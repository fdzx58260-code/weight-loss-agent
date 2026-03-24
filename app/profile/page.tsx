import NavBar from '@/components/NavBar'
import ProfileCard from '@/components/ProfileCard'
import { MOCK_USER } from '@/data/mockUser'
import { calcBMI, getMedicationWeeks, formatDate } from '@/lib/utils'

export default function ProfilePage() {
  const profile = MOCK_USER
  const bmi = profile.heightCm && profile.currentWeightKg ? calcBMI(profile.currentWeightKg, profile.heightCm) : null
  const medWeeks = profile.medicationStartDate ? getMedicationWeeks(profile.medicationStartDate) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">我的档案</h1>
        <ProfileCard profile={profile} />

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">基本信息</h2>
          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="年龄" value={`${profile.age} 岁`} />
            <InfoItem label="性别" value={profile.sex === 'FEMALE' ? '女' : '男'} />
            <InfoItem label="身高" value={`${profile.heightCm} cm`} />
            <InfoItem label="BMI" value={bmi ? `${bmi}` : '--'} />
            {profile.waistCm && <InfoItem label="腰围" value={`${profile.waistCm} cm`} />}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">用药信息</h2>
          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="当前药物" value={profile.currentMedication ?? '--'} />
            <InfoItem label="当前剂量" value={profile.currentDose ?? '--'} />
            <InfoItem label="开始日期" value={profile.medicationStartDate ? formatDate(profile.medicationStartDate) : '--'} />
            <InfoItem label="用药周数" value={`第 ${medWeeks} 周`} />
          </div>
        </div>

        {profile.conditions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">既往病史</h2>
            <div className="flex flex-wrap gap-2">
              {profile.conditions.map((c) => (
                <span key={c} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  )
}
