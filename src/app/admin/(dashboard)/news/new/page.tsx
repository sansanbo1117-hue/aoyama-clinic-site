import { NewsForm } from "@/components/admin/news-form";

export default function AdminNewNewsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-primary">お知らせを新規作成</h1>
      <div className="mt-6">
        <NewsForm />
      </div>
    </div>
  );
}
