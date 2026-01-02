import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen } from "lucide-react";

interface SuraData {
  id: string;
  sura_number: number;
  sura_name: string;
  cassette_count: string | null;
}

interface SurasPageProps {
  isAdmin: boolean;
}

const SurasPage = ({ isAdmin }: SurasPageProps) => {
  const { toast } = useToast();
  const [suras, setSuras] = useState<SuraData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Load suras data
  useEffect(() => {
    const loadSuras = async () => {
      try {
        const { data, error } = await supabase
          .from("suras_cassette_data")
          .select("*")
          .order("sura_number", { ascending: true });

        if (error) throw error;
        setSuras(data?.map(d => ({ ...d, cassette_count: d.cassette_count?.toString() || null })) as SuraData[] || []);
      } catch (error) {
        console.error("Error loading suras:", error);
        toast({
          title: "Error",
          description: "Failed to load suras data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSuras();
  }, [toast]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('suras-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'suras_cassette_data' },
        async () => {
          const { data } = await supabase
            .from("suras_cassette_data")
            .select("*")
            .order("sura_number", { ascending: true });
          if (data) setSuras(data.map(d => ({ ...d, cassette_count: d.cassette_count?.toString() || null })) as SuraData[]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCellClick = (sura: SuraData) => {
    if (!isAdmin) return;
    setEditingId(sura.id);
    setEditValue(sura.cassette_count || "");
  };

  const handleSave = async (suraId: string) => {
    const trimmedValue = editValue.trim();
    
    // Allow empty or comma-separated numbers like "168, 167, 169"
    if (trimmedValue !== "") {
      const parts = trimmedValue.split(',').map(p => p.trim());
      const allValid = parts.every(p => /^\d+$/.test(p));
      if (!allValid) {
        toast({
          title: "Invalid input",
          description: "Please enter valid numbers separated by commas (e.g., 168, 167, 169).",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const { error } = await supabase
        .from("suras_cassette_data")
        .update({ 
          cassette_count: trimmedValue || null as any,
          updated_at: new Date().toISOString()
        })
        .eq("id", suraId);

      if (error) throw error;
      
      setSuras(prev => prev.map(s => 
        s.id === suraId ? { ...s, cassette_count: trimmedValue || null } : s
      ));
      setEditingId(null);
      toast({ title: "Saved" });
    } catch (error) {
      console.error("Error saving cassette count:", error);
      toast({
        title: "Error",
        description: "Failed to save cassette count.",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, suraId: string) => {
    if (e.key === "Enter") {
      handleSave(suraId);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  const handleBlur = (suraId: string) => {
    handleSave(suraId);
  };

  // Calculate total suras that have cassette data
  const totalFilledSuras = suras.filter(s => s.cassette_count && s.cassette_count.trim() !== "").length;

  // Calculate total cassettes by counting all numbers (before and after commas)
  const totalCassettes = suras.reduce((total, sura) => {
    if (!sura.cassette_count || sura.cassette_count.trim() === "") return total;
    const parts = sura.cassette_count.split(',').map(p => p.trim()).filter(p => /^\d+$/.test(p));
    return total + parts.length;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Loading suras data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-2 pb-4">
      {/* Header with Total Suras and Cassettes Counter */}
      <div className="text-center py-3 space-y-2">
        <h2 className="text-xl font-bold text-foreground mb-2">ሱራዎች (Suras)</h2>
        <div className="flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full">
            <BookOpen className="w-5 h-5" />
            <span className="font-bold text-lg">{totalFilledSuras} / 114</span>
            <span className="text-sm opacity-90">Total Suras</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-full">
            <span className="font-bold text-lg">{totalCassettes}</span>
            <span className="text-sm opacity-90">Total Cassettes</span>
          </div>
        </div>
      </div>

      {/* Suras Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[50px_1fr_1fr] bg-captured-header text-white font-bold text-sm">
          <div className="py-2 px-2 text-center border-r border-white/20">ተቁ</div>
          <div className="py-2 px-2 text-center border-r border-white/20">ሱራ</div>
          <div className="py-2 px-2 text-center">ካሴት</div>
        </div>

        {/* Table Body */}
        <ScrollArea className="h-[calc(100vh-300px)]">
          {suras.map((sura, index) => (
            <div 
              key={sura.id}
              className={`grid grid-cols-[50px_1fr_1fr] text-sm ${
                index % 2 === 0 ? 'bg-card' : 'bg-muted/30'
              } border-b border-border last:border-b-0`}
            >
              <div className="py-2 px-2 text-center font-medium border-r border-border">
                {sura.sura_number}
              </div>
              <div className="py-2 px-2 text-center border-r border-border">
                {sura.sura_name}
              </div>
              <div 
                className={`py-1 px-1 text-center ${isAdmin ? 'cursor-pointer hover:bg-muted' : ''}`}
                onClick={() => handleCellClick(sura)}
              >
                {editingId === sura.id ? (
                  <Input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, sura.id)}
                    onBlur={() => handleBlur(sura.id)}
                    autoFocus
                    placeholder="e.g., 168, 167"
                    className="h-7 text-center text-xs p-1"
                  />
                ) : (
                  <span className={sura.cassette_count ? 'font-medium text-xs' : 'text-muted-foreground'}>
                    {sura.cassette_count ?? '-'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};

export default SurasPage;
