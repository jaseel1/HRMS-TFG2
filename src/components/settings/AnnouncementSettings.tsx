import { useState, useEffect } from "react";
import { Megaphone, Save } from "lucide-react";
import { useAnnouncementBanners, useUpsertAnnouncementBanner } from "@/hooks/useAnnouncementBanners";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface BannerFormData {
  message: string;
  color: "red" | "yellow";
  is_active: boolean;
}

export function AnnouncementSettings() {
  const { toast } = useToast();
  const { data: banners, isLoading } = useAnnouncementBanners();
  const upsertBanner = useUpsertAnnouncementBanner();

  const [banner1, setBanner1] = useState<BannerFormData>({
    message: "",
    color: "yellow",
    is_active: false,
  });

  const [banner2, setBanner2] = useState<BannerFormData>({
    message: "",
    color: "red",
    is_active: false,
  });

  useEffect(() => {
    if (banners) {
      const b1 = banners.find((b) => b.position === 1);
      const b2 = banners.find((b) => b.position === 2);

      if (b1) {
        setBanner1({
          message: b1.message,
          color: b1.color as "red" | "yellow",
          is_active: b1.is_active,
        });
      }

      if (b2) {
        setBanner2({
          message: b2.message,
          color: b2.color as "red" | "yellow",
          is_active: b2.is_active,
        });
      }
    }
  }, [banners]);

  const handleSave = async () => {
    try {
      await Promise.all([
        upsertBanner.mutateAsync({ ...banner1, position: 1 }),
        upsertBanner.mutateAsync({ ...banner2, position: 2 }),
      ]);
      toast({ title: "Announcements updated successfully" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <CardTitle>Scrolling Announcements</CardTitle>
        </div>
        <CardDescription>
          Set up to 2 scrolling notification banners visible to all users. Use HTML for hyperlinks:
          <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">
            {"<a href=\"URL\">Link Text</a>"}
          </code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {[
          { data: banner1, setData: setBanner1, label: "Banner 1" },
          { data: banner2, setData: setBanner2, label: "Banner 2" },
        ].map(({ data, setData, label }) => (
          <div key={label} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">{label}</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor={`${label}-active`} className="text-sm text-muted-foreground">
                  Active
                </Label>
                <Switch
                  id={`${label}-active`}
                  checked={data.is_active}
                  onCheckedChange={(checked) => setData((p) => ({ ...p, is_active: checked }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Enter announcement message... Use <a href='URL'>text</a> for links"
                value={data.message}
                onChange={(e) => setData((p) => ({ ...p, message: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Banner Color</Label>
              <RadioGroup
                value={data.color}
                onValueChange={(v) => setData((p) => ({ ...p, color: v as "red" | "yellow" }))}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yellow" id={`${label}-yellow`} />
                  <Label
                    htmlFor={`${label}-yellow`}
                    className={cn(
                      "rounded px-3 py-1 text-sm font-medium cursor-pointer",
                      "bg-yellow-500 text-yellow-950"
                    )}
                  >
                    Yellow
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="red" id={`${label}-red`} />
                  <Label
                    htmlFor={`${label}-red`}
                    className={cn(
                      "rounded px-3 py-1 text-sm font-medium cursor-pointer",
                      "bg-red-500 text-white"
                    )}
                  >
                    Red
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Preview */}
            {data.message && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Preview:</Label>
                <div
                  className={cn(
                    "overflow-hidden rounded-md py-2 text-sm font-medium",
                    data.color === "yellow" ? "bg-yellow-500 text-yellow-950" : "bg-red-500 text-white"
                  )}
                >
                  <div className="marquee-preview px-4">
                    <span dangerouslySetInnerHTML={{ __html: data.message }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        <Button
          onClick={handleSave}
          disabled={upsertBanner.isPending}
          className="w-full sm:w-auto"
        >
          <Save className="mr-2 h-4 w-4" />
          {upsertBanner.isPending ? "Saving..." : "Save Announcements"}
        </Button>
      </CardContent>
    </Card>
  );
}
