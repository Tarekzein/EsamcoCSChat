import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { submitLeadForm } from '../chatSlice.js'

export default function LeadForm() {
  const dispatch = useDispatch()
  const departments = useSelector((s) => s.chat.departments)
  const departmentsError = useSelector((s) => s.chat.departmentsError)
  const leadFormError = useSelector((s) => s.chat.leadFormError)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ visitor_name: '', visitor_phone: '', visitor_email: '', department_id: '' })

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await dispatch(
        submitLeadForm({
          visitorName: form.visitor_name,
          visitorPhone: form.visitor_phone,
          visitorEmail: form.visitor_email,
          departmentId: form.department_id,
        })
      ).unwrap()
    } catch {
      // leadFormError is already set by the thunk
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="esamco-chat-form" onSubmit={handleSubmit}>
      <p className="esamco-chat-form-intro">شاركنا بياناتك ليتواصل معك أحد ممثلي خدمة العملاء.</p>

      <label>
        الاسم
        <input
          name="visitor_name"
          value={form.visitor_name}
          onChange={update('visitor_name')}
          required
          minLength={3}
        />
      </label>

      <label>
        رقم الهاتف
        <input name="visitor_phone" value={form.visitor_phone} onChange={update('visitor_phone')} required />
      </label>

      <label>
        البريد الإلكتروني (اختياري)
        <input name="visitor_email" type="email" value={form.visitor_email} onChange={update('visitor_email')} />
      </label>

      {departmentsError ? (
        <div className="esamco-chat-form-error">تعذر تحميل الأقسام، حاول مرة أخرى.</div>
      ) : (
        <label>
          القسم
          <select
            name="department_id"
            value={form.department_id}
            onChange={update('department_id')}
            required
            disabled={departments.length === 0}
          >
            <option value="" disabled>
              {departments.length ? 'اختر القسم' : 'جاري التحميل...'}
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {leadFormError && <div className="esamco-chat-form-error">{leadFormError}</div>}

      <button className="esamco-chat-btn primary esamco-chat-form-submit" type="submit" disabled={departmentsError || submitting}>
        {submitting ? <span className="esamco-chat-spinner" /> : 'إرسال'}
      </button>
    </form>
  )
}
