"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export type CMSTable =
  | "site_settings"
  | "theme_settings"
  | "menu_items"
  | "about_content"
  | "business_network"
  | "service_categories"
  | "services";

export interface CMSData {
  siteSettings: Record<string, any>;
  themeSettings: Record<string, string>;
  menuItems: any[];
  aboutContent: Record<string, any>;
  businessNetwork: any[];
  serviceCategories: any[];
  services: any[];
}

interface CMSContextType {
  data: CMSData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  save: (payload: {
    table: CMSTable;
    data: any;
    recordId?: string | number;
    oldValue?: any;
  }) => Promise<{ success: boolean; error?: string; result?: any }>;
  remove: (table: CMSTable, recordId: string | number) => Promise<{ success: boolean; error?: string }>;
  liveEditMode: boolean;
  setLiveEditMode: (v: boolean) => void;
  isAdmin: boolean;
  user: any;
}

const defaultData: CMSData = {
  siteSettings: {},
  themeSettings: {},
  menuItems: [],
  aboutContent: {},
  businessNetwork: [],
  serviceCategories: [],
  services: [],
};

const CMSContext = createContext<CMSContextType>({
  data: defaultData,
  loading: true,
  error: null,
  refresh: async () => {},
  save: async () => ({ success: false }),
  remove: async () => ({ success: false }),
  liveEditMode: false,
  setLiveEditMode: () => {},
  isAdmin: false,
  user: null,
});

export function useCMS() {
  return useContext(CMSContext);
}

export function CMSProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CMSData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [liveEditMode, setLiveEditMode] = useState(false);

  const isAdmin = user?.role === "SUPER_ADMIN";

  // Disable live edit when admin logs out or is not super admin
  useEffect(() => {
    if (!isAdmin && liveEditMode) setLiveEditMode(false);
  }, [isAdmin, liveEditMode]);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [cmsRes, userRes] = await Promise.all([
        fetch("/api/cms"),
        fetch("/api/auth/me"),
      ]);

      const cmsJson = await cmsRes.json();
      const userJson = await userRes.json();

      if (userJson.user) setUser(userJson.user);

      if (cmsJson.error) {
        setError(cmsJson.error);
      } else {
        const siteSettingsMap: Record<string, any> = {};
        for (const row of cmsJson.siteSettings || []) {
          siteSettingsMap[row.key] = row.value;
        }
        const themeSettingsMap: Record<string, string> = {};
        for (const row of cmsJson.themeSettings || []) {
          themeSettingsMap[row.key] = row.value;
        }
        const aboutContentMap: Record<string, any> = {};
        for (const row of cmsJson.aboutContent || []) {
          aboutContentMap[row.key] = row.value;
        }

        setData({
          siteSettings: siteSettingsMap,
          themeSettings: themeSettingsMap,
          menuItems: cmsJson.menuItems || [],
          aboutContent: aboutContentMap,
          businessNetwork: cmsJson.businessNetwork || [],
          serviceCategories: cmsJson.serviceCategories || [],
          services: cmsJson.services || [],
        });
        setError(null);
      }
    } catch (err) {
      setError("خطا در بارگذاری محتوا");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const save = useCallback(
    async (payload: {
      table: CMSTable;
      data: any;
      recordId?: string | number;
      oldValue?: any;
    }) => {
      if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز" };
      try {
        const res = await fetch("/api/cms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "upsert", ...payload }),
        });
        const json = await res.json();
        if (json.success) {
          await fetchAll();
        }
        return { success: json.success, error: json.error, result: json[payload.table] };
      } catch (err) {
        return { success: false, error: "خطا در ذخیره" };
      }
    },
    [isAdmin, fetchAll]
  );

  const remove = useCallback(
    async (table: CMSTable, recordId: string | number) => {
      if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز" };
      try {
        const res = await fetch("/api/cms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", table, recordId }),
        });
        const json = await res.json();
        if (json.success) await fetchAll();
        return { success: json.success, error: json.error };
      } catch (err) {
        return { success: false, error: "خطا در حذف" };
      }
    },
    [isAdmin, fetchAll]
  );

  return (
    <CMSContext.Provider
      value={{
        data,
        loading,
        error,
        refresh: fetchAll,
        save,
        remove,
        liveEditMode: isAdmin && liveEditMode,
        setLiveEditMode,
        isAdmin,
        user,
      }}
    >
      <div data-live-edit={isAdmin && liveEditMode ? "true" : "false"} className="contents">
        {children}
      </div>
    </CMSContext.Provider>
  );
}
