import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          <span>رجوع</span>
        </button>

        <div className="bg-card rounded-xl border border-gold-light p-6 md:p-8 shadow-islamic">
          <h1 className="text-3xl font-amiri font-bold text-foreground mb-2 text-center">
            سياسة الخصوصية
          </h1>
          <p className="text-center text-muted-foreground text-sm mb-8">
            آخر تحديث: ٢٧ فبراير ٢٠٢٦
          </p>

          <div className="space-y-6 font-arabic leading-8 text-foreground">
            <section>
              <h2 className="text-xl font-bold font-amiri text-primary mb-2">مقدمة</h2>
              <p>
                مرحباً بكم في تطبيق <strong>ختمة القرآن الكريم</strong>. نحن نحترم خصوصيتكم ونلتزم بحماية بياناتكم الشخصية. توضح سياسة الخصوصية هذه كيفية تعاملنا مع معلوماتكم عند استخدام تطبيقنا.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-amiri text-primary mb-2">البيانات التي نجمعها</h2>
              <p>
                تطبيق ختمة القرآن الكريم <strong>لا يجمع أي بيانات شخصية</strong> من المستخدمين. لا نطلب منكم التسجيل أو إنشاء حساب، ولا نجمع أياً من المعلومات التالية:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>الاسم أو البريد الإلكتروني</li>
                <li>رقم الهاتف</li>
                <li>الموقع الجغرافي</li>
                <li>جهات الاتصال</li>
                <li>الصور أو الملفات</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold font-amiri text-primary mb-2">استخدام الإنترنت</h2>
              <p>
                يستخدم التطبيق الاتصال بالإنترنت فقط لغرض <strong>تحميل التلاوات الصوتية</strong> للآيات القرآنية من خوادم خارجية (api.alquran.cloud). لا يتم إرسال أي بيانات من جهازكم إلى أي خادم.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-amiri text-primary mb-2">التخزين المحلي</h2>
              <p>
                قد يقوم التطبيق بتخزين بعض البيانات محلياً على جهازكم (مثل آخر سورة تمت قراءتها) لتحسين تجربة الاستخدام. هذه البيانات تبقى على جهازكم فقط ولا يتم مشاركتها مع أي طرف ثالث.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-amiri text-primary mb-2">الإعلانات</h2>
              <p>
                التطبيق <strong>لا يحتوي على أي إعلانات</strong> ولا يستخدم أي شبكات إعلانية.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-amiri text-primary mb-2">خدمات الطرف الثالث</h2>
              <p>
                يستخدم التطبيق واجهة برمجة التطبيقات (API) التالية لجلب بيانات القرآن الكريم والتلاوات الصوتية:
              </p>
              <ul className="list-disc list-inside mt-2 text-muted-foreground">
                <li>AlQuran Cloud API - لنصوص الآيات والتلاوات الصوتية</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold font-amiri text-primary mb-2">أمان البيانات</h2>
              <p>
                بما أن التطبيق لا يجمع بيانات شخصية، فلا توجد مخاطر تتعلق بتسريب أو اختراق البيانات الشخصية.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-amiri text-primary mb-2">خصوصية الأطفال</h2>
              <p>
                التطبيق آمن للاستخدام من قبل جميع الفئات العمرية بما في ذلك الأطفال، حيث لا يجمع أي بيانات ولا يحتوي على محتوى غير مناسب.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-amiri text-primary mb-2">التعديلات على سياسة الخصوصية</h2>
              <p>
                قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سيتم نشر أي تغييرات على هذه الصفحة مع تحديث تاريخ "آخر تحديث".
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-amiri text-primary mb-2">تواصل معنا</h2>
              <p>
                إذا كان لديكم أي أسئلة أو استفسارات حول سياسة الخصوصية، يمكنكم التواصل معنا عبر البريد الإلكتروني:
              </p>
              <p className="mt-2 text-primary font-bold" dir="ltr">
                libyafreea@gmail.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
