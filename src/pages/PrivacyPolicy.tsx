import { useNavigate } from "react-router-dom";
import { ArrowRight, AlertTriangle } from "lucide-react";


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
          <p className="text-center text-muted-foreground text-sm mb-4">
            آخر تحديث: ١٧ مايو ٢٠٢٦
          </p>

          {/* Prominent Ads Declaration */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600 rounded-lg p-4 mb-8 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 dark:text-amber-300 text-lg mb-1">
                يحتوي هذا التطبيق على إعلانات
              </p>
              <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed">
                يستخدم تطبيق ختمة القرآن الكريم خدمة <strong>Google AdMob</strong> لعرض الإعلانات. تساعدنا هذه الإعلانات في الاستمرار بتقديم التطبيق مجاناً للجميع. لمزيد من التفاصيل، يرجى مراجعة قسم الإعلانات أدناه.
              </p>
            </div>
          </div>

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
                يحتوي هذا التطبيق على <strong>إعلانات</strong> يتم عرضها عبر خدمة <strong>Google AdMob</strong> التابعة لشركة Google. تساعدنا هذه الإعلانات على الاستمرار في تقديم التطبيق مجاناً.
              </p>
              <p className="mt-2">
                قد تقوم خدمة Google AdMob ومزودوها الخارجيون بجمع واستخدام بعض المعلومات (مثل معرّف الإعلان الخاص بجهازك، وعنوان IP، ونوع الجهاز، والتفاعل مع الإعلانات) لعرض إعلانات مخصصة أو غير مخصصة. لا يقوم تطبيقنا بنفسه بجمع أو تخزين أي من هذه البيانات.
              </p>
              <p className="mt-2">
                يمكنك في أي وقت إعادة ضبط معرّف الإعلان أو إيقاف الإعلانات المخصصة من إعدادات جهازك. لمزيد من المعلومات، يمكنك مراجعة سياسة خصوصية Google:
                {" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                  dir="ltr"
                >
                  https://policies.google.com/privacy
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-amiri text-primary mb-2">خدمات الطرف الثالث</h2>
              <p>
                يستخدم التطبيق الخدمات الخارجية التالية:
              </p>
              <ul className="list-disc list-inside mt-2 text-muted-foreground">
                <li>AlQuran Cloud API — لنصوص الآيات والتلاوات الصوتية</li>
                <li>Google AdMob — لعرض الإعلانات داخل التطبيق</li>
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
                التطبيق لا يجمع أي بيانات شخصية ولا يحتوي على محتوى غير مناسب. ومع ذلك، نظراً لاحتواء التطبيق على إعلانات من Google AdMob، يُنصح بإشراف الوالدين عند استخدام الأطفال للتطبيق.
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
