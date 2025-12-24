import { useState, useMemo } from "react";
import { Calculator, Ruler, Home, Paintbrush, Wrench, Zap, Droplets, Check, ArrowRight, Phone, ChevronDown, ChevronUp, Clock, Download, Mail, User } from "lucide-react";
import { jsPDF } from "jspdf";
import renovivoLogo from "@/assets/renovivo-logo.png";
import { useToast } from "@/hooks/use-toast";

type RoomType = "apartment" | "house" | "office" | "bathroom" | "kitchen";
type RenovationType = "cosmetic" | "standard" | "major" | "premium";

interface RenovationTypeData {
  id: RenovationType;
  name: string;
  shortDescription: string;
  pricePerSqm: number;
  duration: string;
  details: string[];
}

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

const renovationTypes: RenovationTypeData[] = [
  { 
    id: "cosmetic", 
    name: "Козметичен ремонт", 
    shortDescription: "Бързо освежаване на вашия дом",
    pricePerSqm: 80,
    duration: "1-2 седмици",
    details: [
      "Боядисване на стени и тавани",
      "Малки козметични поправки",
      "Освежаване на фугите",
      "Почистване и подготовка",
      "Идеален за бързо обновяване преди продажба или наем"
    ]
  },
  { 
    id: "standard", 
    name: "Стандартен ремонт", 
    shortDescription: "Довършителни дейности в ново строителство",
    pricePerSqm: 180,
    duration: "3-6 седмици",
    details: [
      "Шпакловка и боядисване",
      "Полагане на подови настилки",
      "Монтаж на врати и первази",
      "Монтаж на осветителни тела",
      "Завършване на бани и санитария",
      "Подходящ за нови жилища, които се нуждаят от финални довършителни работи"
    ]
  },
  { 
    id: "major", 
    name: "Основен ремонт", 
    shortDescription: "Цялостно обновяване на старо жилище",
    pricePerSqm: 400,
    duration: "2-3 месеца",
    details: [
      "Подмяна на цялата ВиК инсталация",
      "Подмяна на електрическа инсталация",
      "Нова отоплителна система (ОВК)",
      "Събаряне на стари настилки и мазилки",
      "Изравняване на стени и подове",
      "Цялостна подмяна на дограма (при нужда)",
      "Подходящ за панелни, ЕПК и тухлени сгради, които се нуждаят от пълно обновяване"
    ]
  },
  { 
    id: "premium", 
    name: "Premium", 
    shortDescription: "Цялостен ремонт с дизайн и авторски надзор",
    pricePerSqm: 550,
    duration: "3-5 месеца",
    details: [
      "Включва всичко от основния ремонт",
      "Професионален интериорен дизайн",
      "Авторски надзор през целия процес",
      "Достъп до ексклузивни материали и решения",
      "Персонализирани мебели по поръчка (опция)",
      "Умен дом системи и автоматизация (опция)",
      "VIP обслужване с личен мениджър проект"
    ]
  },
];

const additionalServices: ServiceOption[] = [
  { id: "electrical", name: "Електро инсталация", pricePerSqm: 25, icon: <Zap className="w-5 h-5" /> },
  { id: "plumbing", name: "ВиК инсталация", pricePerSqm: 30, icon: <Droplets className="w-5 h-5" /> },
  { id: "flooring", name: "Подови настилки", pricePerSqm: 45, icon: <Home className="w-5 h-5" /> },
  { id: "painting", name: "Боядисване", pricePerSqm: 15, icon: <Paintbrush className="w-5 h-5" /> },
  { id: "demolition", name: "Демонтаж", pricePerSqm: 20, icon: <Wrench className="w-5 h-5" /> },
];

const Index = () => {
  const { toast } = useToast();
  const [area, setArea] = useState<number>(60);
  const [roomType, setRoomType] = useState<RoomType>("apartment");
  const [renovationType, setRenovationType] = useState<RenovationType>("standard");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [expandedType, setExpandedType] = useState<RenovationType | null>(null);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    email: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const toggleExpanded = (typeId: RenovationType) => {
    setExpandedType(prev => prev === typeId ? null : typeId);
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

  const generatePDF = () => {
    const doc = new jsPDF();
    const room = roomTypes.find(r => r.id === roomType)!;
    const renovation = renovationTypes.find(r => r.id === renovationType)!;
    
    // Header
    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("RENOVIVO", 20, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(180, 180, 180);
    doc.text("Every detail matters", 20, 32);
    
    // Title
    doc.setTextColor(26, 26, 26);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("ОФЕРТА ЗА РЕМОНТ", 20, 55);
    
    // Date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Дата: ${new Date().toLocaleDateString('bg-BG')}`, 20, 63);
    
    // Customer info if available
    let yPos = 75;
    if (contactForm.name || contactForm.email || contactForm.phone) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 26, 26);
      doc.text("Клиент:", 20, yPos);
      yPos += 8;
      doc.setFont("helvetica", "normal");
      if (contactForm.name) {
        doc.text(`Име: ${contactForm.name}`, 20, yPos);
        yPos += 6;
      }
      if (contactForm.email) {
        doc.text(`Имейл: ${contactForm.email}`, 20, yPos);
        yPos += 6;
      }
      if (contactForm.phone) {
        doc.text(`Телефон: ${contactForm.phone}`, 20, yPos);
        yPos += 6;
      }
      yPos += 10;
    }
    
    // Project details
    doc.setFillColor(245, 245, 245);
    doc.rect(15, yPos - 5, 180, 45, 'F');
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 26, 26);
    doc.text("Детайли на проекта:", 20, yPos + 5);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Тип помещение: ${room.name}`, 20, yPos + 15);
    doc.text(`Площ: ${area} кв.м.`, 20, yPos + 23);
    doc.text(`Вид ремонт: ${renovation.name}`, 20, yPos + 31);
    doc.text(`Ориентировъчен срок: ${renovation.duration}`, 120, yPos + 31);
    
    yPos += 55;
    
    // What's included
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Какво включва:", 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    renovation.details.forEach((detail) => {
      doc.text(`• ${detail}`, 25, yPos);
      yPos += 6;
    });
    
    yPos += 5;
    
    // Additional services
    if (selectedServices.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Допълнителни услуги:", 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      selectedServices.forEach((serviceId) => {
        const service = additionalServices.find(s => s.id === serviceId);
        if (service) {
          doc.text(`• ${service.name} (${service.pricePerSqm} лв/м²)`, 25, yPos);
          yPos += 6;
        }
      });
      yPos += 5;
    }
    
    // Price breakdown
    doc.setFillColor(212, 175, 55);
    doc.rect(15, yPos, 180, 50, 'F');
    
    doc.setTextColor(26, 26, 26);
    doc.setFontSize(11);
    doc.text(`Базова цена: ${calculation.basePrice.toLocaleString()} лв`, 20, yPos + 12);
    
    if (calculation.servicesPrice > 0) {
      doc.text(`Допълнителни услуги: ${calculation.servicesPrice.toLocaleString()} лв`, 20, yPos + 20);
    }
    
    if (calculation.discount > 0) {
      doc.text(`Отстъпка (5%): -${calculation.discount.toLocaleString()} лв`, 20, yPos + 28);
    }
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`ОБЩА ЦЕНА: ${calculation.total.toLocaleString()} лв`, 20, yPos + 42);
    
    // Footer note
    yPos += 60;
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("* Посочените цени и срокове са ориентировъчни.", 20, yPos);
    doc.text("Крайната цена се определя след оглед на обекта.", 20, yPos + 5);
    
    // Contact info
    yPos += 20;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Контакти: +359 89 371 29 19 | renovivo.bg", 20, yPos);
    
    doc.save("Renovivo_Oфeрта.pdf");
    
    toast({
      title: "PDF е изтеглен",
      description: "Вашата оферта е запазена успешно.",
    });
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.phone || !contactForm.email) {
      toast({
        title: "Моля, попълнете всички полета",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate sending - in real app would call an edge function
    setTimeout(() => {
      toast({
        title: "Заявката е изпратена!",
        description: "Ще се свържем с вас до 24 часа.",
      });
      setIsSubmitting(false);
    }, 1000);
  };

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
              
              <p className="text-muted-foreground text-sm mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Посочените цени и срокове са ориентировъчни
              </p>
              
              <div className="space-y-4">
                {renovationTypes.map((type) => (
                  <div key={type.id} className="border-2 border-border transition-all duration-200">
                    <button
                      onClick={() => setRenovationType(type.id)}
                      className={`w-full p-5 text-left transition-all duration-200 group
                        ${renovationType === type.id 
                          ? "bg-primary/10 border-b-2 border-primary" 
                          : "bg-secondary hover:bg-secondary/80"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 border-2 flex items-center justify-center transition-colors
                            ${renovationType === type.id 
                              ? "border-primary bg-primary" 
                              : "border-border"
                            }`}
                          >
                            {renovationType === type.id && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>
                          <span className={`font-display text-xl ${renovationType === type.id ? "text-primary" : "text-foreground"}`}>
                            {type.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-primary font-display text-lg">от {type.pricePerSqm} лв/м²</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpanded(type.id);
                            }}
                            className="p-1 hover:bg-primary/20 rounded transition-colors"
                          >
                            {expandedType === type.id ? (
                              <ChevronUp className="w-5 h-5 text-primary" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm ml-8">{type.shortDescription}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 ml-8">
                        <Clock className="w-3 h-3" />
                        <span>Срок: {type.duration}</span>
                      </div>
                    </button>
                    
                    {/* Expanded details */}
                    {expandedType === type.id && (
                      <div className="p-5 bg-card border-t border-border animate-fade-in">
                        <h4 className="font-display text-lg text-foreground mb-3">Какво включва:</h4>
                        <ul className="space-y-2">
                          {type.details.map((detail, index) => (
                            <li key={index} className="flex items-start gap-2 text-muted-foreground text-sm">
                              <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
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

              {/* Contact Form */}
              <form onSubmit={handleSubmitContact} className="space-y-4 mb-6">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Вашето име"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 bg-secondary border-2 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="Телефон"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 bg-secondary border-2 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Имейл"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 bg-secondary border-2 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="brutal-button w-full flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? "Изпращане..." : "Изпрати заявка"}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>

              <button 
                onClick={generatePDF}
                className="w-full border-2 border-primary bg-transparent text-primary py-3 font-display text-lg flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Изтегли PDF оферта</span>
              </button>

              <p className="text-center text-muted-foreground text-xs mt-4">
                *Цените и сроковете са ориентировъчни. Крайната цена се определя след оглед.
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
