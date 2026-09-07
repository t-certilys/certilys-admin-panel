import { CourseDetailPage } from "@/components/certilys-ui/courses";
import { CourseReviewsPanel } from "@/components/certilys-ui/courses/course-reviews-panel";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <CourseDetailPage />
      <div className="px-4 pb-8 lg:px-6">
        <CourseReviewsPanel key={id} courseId={id} />
      </div>
    </>
  );
}
