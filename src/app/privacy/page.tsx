import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[#E5E7EB] bg-[#FAF9F7]">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-semibold">WHISPER</Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12 prose prose-sm">
        <h1 className="text-2xl font-semibold text-[#211F27] mb-6">Privacy Notice</h1>

        <p className="text-[#6B7280] leading-relaxed mb-4">
          WHISPER is designed to be anonymous for students. We collect as little information as possible.
        </p>

        <h2 className="text-lg font-medium text-[#211F27] mt-8 mb-3">What we store</h2>
        <ul className="list-disc pl-5 text-[#6B7280] space-y-2">
          <li>The text of your confession</li>
          <li>Optional category you choose</li>
          <li>Timestamp of submission</li>
          <li>An anonymous session cookie only used to prevent duplicate likes</li>
        </ul>

        <h2 className="text-lg font-medium text-[#211F27] mt-8 mb-3">What we do NOT store or show</h2>
        <ul className="list-disc pl-5 text-[#6B7280] space-y-2">
          <li>Your name, email, phone number, or student ID</li>
          <li>Public profiles or user accounts for students</li>
          <li>IP addresses in the public feed or to other students</li>
        </ul>

        <h2 className="text-lg font-medium text-[#211F27] mt-8 mb-3">Who can see submissions</h2>
        <p className="text-[#6B7280] leading-relaxed mb-4">
          New confessions are marked as Pending and are only visible to the site owner/admin.
          Only after an admin approves a confession does it become publicly visible.
          Rejected confessions stay private and can be permanently deleted by the admin.
        </p>

        <h2 className="text-lg font-medium text-[#211F27] mt-8 mb-3">Reporting</h2>
        <p className="text-[#6B7280] leading-relaxed mb-4">
          Anyone can report a published confession. The admin reviews reports and can remove content that violates community safety.
        </p>

        <h2 className="text-lg font-medium text-[#211F27] mt-8 mb-3">Important note</h2>
        <p className="text-[#6B7280] leading-relaxed mb-4">
          Absolute anonymity from the hosting provider or legal authorities cannot be guaranteed.
          Do not post content that identifies specific people in a harmful way, contains threats, or includes private contact information.
        </p>

        <div className="mt-10">
          <Link href="/" className="btn-secondary">
            Back to home
          </Link>
        </div>
      </main>
    </div>
  )
}
