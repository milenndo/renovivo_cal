import { useState, useMemo } from "react";
import { Calculator, Ruler, Home, Paintbrush, Wrench, Zap, Droplets, Check, ArrowRight, Phone } from "lucide-react";
import renovivoLogo from "@/assets/renovivo-logo.png";

type RoomType = "apartment" | "house" | "office" | "bathroom" | "kitchen";
type RenovationType = "cosmetic" | "standard" | "premium" | "luxury";

interface ServiceOption {
  id: string;
  name: string;
  pricePerSqm: number;
  icon: React.ReactNode;
}

const roomTypes: { id: RoomType; name: string; baseMultiplier: number }[] = [
  { id: "apartment", name: "Апартамент", baseMultiplier: 1 },
  { id: "house", name: "Къща", baseMultiplier: 1.15 },
  { id: "office", name: "Офис", baseMultiplier: 0.9 },
  { id: "bathroom", name: "Баня", baseMultiplier: 1.4 },
  { id: "kitchen", name: "Кухня", baseMultiplier: 1.25 },
];

const renovationTypes: { id: RenovationType; name: string; description: string; pricePerSqm: number }[] = [
  { id: "cosmetic", name: "Козметичен", description: "Боядисване, малки поправки", pricePerSqm: 80 },
  { id: "standard", name: "Стандартен", description: "Пълен ремонт без преустройство", pricePerSqm: 180 },
  { id: "premium", name: "Премиум", description: "Цялостен ремонт с дизайн", pricePerSqm: 320 },
  { id: "luxury", name: "Лукс", description: "Ексклузивни материали и решения", pricePerSqm: 550 },
];

const additionalServices: ServiceOption[] = [
  { id: "electrical", name: "Електро инсталация", pricePerSqm: 25, icon: <Zap className="w-5 h-5" /> },
  { id: "plumbing", name: "ВиК инсталация", pricePerSqm: 30, icon: <Droplets className="w-5 h-5" /> },
  { id: "flooring", name: "Подови настилки", pricePerSqm: 45, icon: <Home className="w-5 h-5" /> },
  { id: "painting", name: "Боядисване", pricePerSqm: 15, icon: <Paintbrush className="w-5 h-5" /> },
  { id: "demolition", name: "Демонтаж", pricePerSqm: 20, icon: <Wrench className="w-5 h-5" /> },
];

const Index = () => {
  const [area, setArea] = useState<number>(60);
  const [roomType, setRoomType] = useState<RoomType>("apartment");
  const [renovationType, setRenovationType] = useState<RenovationType>("standard");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const calculation = useMemo(() => {
    const room = roomTypes.find(r => r.id === roomType)!;
    const renovation = renovationTypes.find(r => r.id === renovationType)!;
    
    const basePrice = area * renovation.pricePerSqm * room.baseMultiplier;
    
    const servicesPrice = selectedServices.reduce((total, serviceId) => {
      const service = additionalServices.find(s => s.id === serviceId);
      return total + (service ? area * service.pricePerSqm : 0);
    }, 0);

    const subtotal = basePrice + servicesPrice;
    const discount = subtotal > 20000 ? subtotal * 0.05 : 0;
    const total = subtotal - discount;

    return {
      basePrice: Math.round(basePrice),
      servicesPrice: Math.round(servicesPrice),
      discount: Math.round(discount),
      total: Math.round(total),
    };
  }, [area, roomType, renovationType, selectedServices]);

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header */}
      <header className="border-b-2 border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <img src={renovivoLogo} alt="Renovivo" className="h-10 md:h-12" />
          <a 
            href="tel:+359893712919" 
            className="flex items-center gap-2 text-primary font-display text-lg tracking-wide hover:text-primary/80 transition-colors"
          >
            <Phone className="w-5 h-5" />
            <span className="hidden sm:inline">+359 89 371 29 19</span>
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <section className="text-center mb-12 md:mb-16 animate-fade-in">
          <div className="brutal-tag mb-4 mx-auto w-fit">
            <Calculator className="w-4 h-4 mr-2" />
            Онлайн калкулатор
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground mb-4">
            ИЗЧИСЛИ СВОЯ
            <span className="block text-gradient">РЕМОНТ</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Получете ориентировъчна цена за вашия проект за секунди. 
            Без скрити такси, фиксиран бюджет.
          </p>
        </section>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Calculator Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Area Input */}
            <div className="brutal-card p-6 md:p-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary flex items-center justify-center">
                  <Ruler className="w-5 h-5 text-primary-foreground" />
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-foreground">КВАДРАТУРА</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Площ в кв.м.</span>
                  <span className="font-display text-4xl text-primary">{area}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  className="w-full h-2 bg-secondary appearance-none cursor-pointer accent-primary
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                    [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background
                    [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:bg-primary 
                    [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:rounded-none"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>10 м²</span>
                  <span>500 м²</span>
                </div>
              </div>
            </div>

            {/* Room Type */}
            <div className="brutal-card p-6 md:p-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary flex items-center justify-center">
                  <Home className="w-5 h-5 text-primary-foreground" />
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-foreground">ТИП ПОМЕЩЕНИЕ</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {roomTypes.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setRoomType(room.id)}
                    className={`p-4 border-2 transition-all duration-200 text-center
                      ${roomType === room.id 
                        ? "border-primary bg-primary/10 text-foreground" 
                        : "border-border bg-secondary hover:border-primary/50 text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <span className="font-medium text-sm md:text-base">{room.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Renovation Type */}
            <div className="brutal-card p-6 md:p-8 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-primary-foreground" />
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-foreground">ВИД РЕМОНТ</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {renovationTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setRenovationType(type.id)}
                    className={`p-5 border-2 text-left transition-all duration-200 group
                      ${renovationType === type.id 
                        ? "border-primary bg-primary/10" 
                        : "border-border bg-secondary hover:border-primary/50"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-display text-xl ${renovationType === type.id ? "text-primary" : "text-foreground"}`}>
                        {type.name}
                      </span>
                      <span className="text-primary font-display text-lg">{type.pricePerSqm} лв/м²</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Services */}
            <div className="brutal-card p-6 md:p-8 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-foreground">ДОПЪЛНИТЕЛНИ УСЛУГИ</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {additionalServices.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`p-4 border-2 flex items-center gap-3 transition-all duration-200
                      ${selectedServices.includes(service.id)
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary hover:border-primary/50"
                      }`}
                  >
                    <div className={`w-8 h-8 flex items-center justify-center border-2 transition-colors
                      ${selectedServices.includes(service.id)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground"
                      }`}
                    >
                      {selectedServices.includes(service.id) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        service.icon
                      )}
                    </div>
                    <div className="text-left">
                      <p className={`font-medium text-sm ${selectedServices.includes(service.id) ? "text-foreground" : "text-muted-foreground"}`}>
                        {service.name}
                      </p>
                      <p className="text-primary text-xs font-display">{service.pricePerSqm} лв/м²</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Price Summary Panel */}
          <div className="lg:col-span-1">
            <div className="brutal-card p-6 md:p-8 sticky top-24 glow-gold animate-scale-in" style={{ animationDelay: "0.5s" }}>
              <h2 className="font-display text-2xl md:text-3xl text-foreground mb-6 text-center">
                ВАШАТА ОФЕРТА
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Базова цена</span>
                  <span className="font-display text-xl text-foreground">{calculation.basePrice.toLocaleString()} лв</span>
                </div>
                
                {calculation.servicesPrice > 0 && (
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">Допълнителни услуги</span>
                    <span className="font-display text-xl text-foreground">{calculation.servicesPrice.toLocaleString()} лв</span>
                  </div>
                )}
                
                {calculation.discount > 0 && (
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">Отстъпка (5%)</span>
                    <span className="font-display text-xl text-green-500">-{calculation.discount.toLocaleString()} лв</span>
                  </div>
                )}
              </div>

              <div className="bg-primary/10 border-2 border-primary p-6 mb-6">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm mb-1">ОРИЕНТИРОВЪЧНА ЦЕНА</p>
                  <p className="font-display text-5xl md:text-6xl text-primary animate-pulse-gold">
                    {calculation.total.toLocaleString()}
                    <span className="text-2xl ml-2">лв</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Фиксиран бюджет по договор</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Безплатна консултация на място</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>5 години гаранция</span>
                </div>
              </div>

              <a 
                href="https://renovivo.bg/contact" 
                target="_blank"
                rel="noopener noreferrer"
                className="brutal-button w-full flex items-center justify-center gap-2"
              >
                <span>Получи оферта</span>
                <ArrowRight className="w-5 h-5" />
              </a>

              <p className="text-center text-muted-foreground text-xs mt-4">
                *Цената е ориентировъчна. Крайната цена се определя след оглед.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img src={renovivoLogo} alt="Renovivo" className="h-8" />
            <p className="text-muted-foreground text-sm">
              © 2024 Renovivo. Всички права запазени. Every detail matters.
            </p>
            <a 
              href="https://renovivo.bg" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              renovivo.bg
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
