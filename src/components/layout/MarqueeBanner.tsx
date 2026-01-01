import { useActiveAnnouncementBanners } from "@/hooks/useAnnouncementBanners";
import { cn } from "@/lib/utils";

export function MarqueeBanner() {
  const { data: banners } = useActiveAnnouncementBanners();

  if (!banners?.length) return null;

  return (
    <div className="flex flex-col">
      {banners.map((banner) => (
        <div
          key={banner.id}
          className={cn(
            "overflow-hidden py-2 text-sm font-medium",
            banner.color === "yellow" 
              ? "bg-yellow-500 text-yellow-950" 
              : "bg-red-500 text-white"
          )}
        >
          <div className="marquee">
            <div className="marquee-content">
              <span 
                dangerouslySetInnerHTML={{ __html: banner.message }} 
                className="[&_a]:underline [&_a]:font-semibold [&_a:hover]:opacity-80"
              />
              <span className="mx-16">•</span>
              <span 
                dangerouslySetInnerHTML={{ __html: banner.message }}
                className="[&_a]:underline [&_a]:font-semibold [&_a:hover]:opacity-80"
              />
              <span className="mx-16">•</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
