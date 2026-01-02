import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SuraData {
  id: string;
  sura_number: number;
  sura_name: string;
  cassette_count: number | null;
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
        setSuras((data as SuraData[]) || []);
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
          if (data) setSuras(data as SuraData[]);
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
    setEditValue(sura.cassette_count?.toString() || "");
  };

  const handleSave = async (suraId: string) => {
    const numValue = editValue === "" ? null : parseInt(editValue, 10);
    
    if (editValue !== "" && (isNaN(numValue as number) || (numValue as number) < 0)) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("suras_cassette_data")
        .update({ 
          cassette_count: numValue,
          updated_at: new Date().toISOString()
        })
        .eq("id", suraId);

      if (error) throw error;
      
      setSuras(prev => prev.map(s => 
        s.id === suraId ? { ...s, cassette_count: numValue } : s
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

  // Calculate total cassettes
  const totalCassettes = suras.reduce((sum, s) => sum + (s.cassette_count || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Loading suras data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-2 pb-4">
      {/* Header */}
      <div className="text-center py-3">
        <h2 className="text-xl font-bold text-foreground mb-1">ሱራዎች (Suras)</h2>
        <p className="text-sm text-muted-foreground">
          Total Cassettes: <span className="font-bold text-primary">{totalCassettes}</span>
        </p>
      </div>

      {/* Suras Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[50px_1fr_80px] bg-captured-header text-white font-bold text-sm">
          <div className="py-2 px-2 text-center border-r border-white/20">ተቁ</div>
          <div className="py-2 px-2 text-center border-r border-white/20">ሱራ</div>
          <div className="py-2 px-2 text-center">ካሴት</div>
        </div>

        {/* Table Body */}
        <ScrollArea className="h-[calc(100vh-280px)]">
          {suras.map((sura, index) => (
            <div 
              key={sura.id}
              className={`grid grid-cols-[50px_1fr_80px] text-sm ${
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
                    type="number"
                    min="0"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, sura.id)}
                    onBlur={() => handleBlur(sura.id)}
                    autoFocus
                    className="h-7 text-center text-sm p-1"
                  />
                ) : (
                  <span className={sura.cassette_count ? 'font-medium' : 'text-muted-foreground'}>
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
