import React, { useState, useEffect, useMemo, useRef } from "react"; // Import useRef
import {
  Shield,
  AlertTriangle,
  Sun,
  Cloud,
  Droplets,
  Timer,
  ChevronRight,
  Award,
  Zap,
} from "lucide-react";

interface DamageType {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface FormData {
  carMake: string;
  carModel: string;
  carYear: string;
  parkingType: string;
  washFrequency: string;
  currentDamage: string[];
}

interface AnalysisResult {
  riskScore: number;
  monthlyLoss: number;
  yearlyLoss: number;
  fiveYearLoss: number;
  urgencyLevel: string;
  recommendations: string[];
  damageProgression: {
    sixMonths: number;
    oneYear: number;
    threeYears: number;
  };
  specificFactors: string[];
  additionalNotes?: string;
  vehicleSize: string;
}

interface PaintData {
  make: string;
  model: string;
  year: string;
  paintRisk: number;
  notes?: string;
  sizeCategory: string;
  desiredLook?: string;
}

interface Db {
  paints: PaintData[];
}

const damageTypes: DamageType[] = [
  { id: "swirls", label: "Swirl Marks", icon: Sun },
  { id: "scratches", label: "Light Scratches", icon: AlertTriangle },
  { id: "waterSpots", label: "Water Spots", icon: Droplets },
  { id: "oxidation", label: "Paint Oxidation", icon: Cloud },
];

// SVG Components for Vehicle Representation
const SedanSVG = () => (
  <svg viewBox="0 0 100 40" width="100" height="40">
    <rect x="10" y="15" width="80" height="20" fill="#ddd" />
    <circle cx="25" cy="35" r="5" fill="#333" />
    <circle cx="75" cy="35" r="5" fill="#333" />
    <rect x="20" y="10" width="60" height="5" fill="#bbb" />
  </svg>
);

const SUVSVG = () => (
  <svg viewBox="0 0 100 50" width="100" height="50">
    <rect x="10" y="10" width="80" height="30" fill="#ddd" />
    <rect x="20" y="5" width="60" height="5" fill="#bbb" />
    <circle cx="25" cy="40" r="5" fill="#333" />
    <circle cx="75" cy="40" r="5" fill="#333" />
  </svg>
);

const TruckSVG = () => (
  <svg viewBox="0 0 120 60" width="120" height="60">
    <rect x="10" y="10" width="100" height="30" fill="#ddd" />
    <rect x="20" y="5" width="80" height="5" fill="#bbb" />
    <rect x="100" y="20" width="20" height="20" fill="#ddd" /> // Truck bed
    <circle cx="30" cy="45" r="5" fill="#333" />
    <circle cx="90" cy="45" r="5" fill="#333" />
  </svg>
);

const CompactSVG = () => (
  <svg viewBox="0 0 80 35" width="80" height="35">
    <rect x="5" y="15" width="70" height="15" fill="#ddd" />
    <circle cx="20" cy="30" r="4" fill="#333" />
    <circle cx="60" cy="30" r="4" fill="#333" />
    <rect x="15" y="10" width="50" height="5" fill="#bbb" />
  </svg>
);

const LargeSedanSVG = () => (
  <svg viewBox="0 0 110 45" width="110" height="45">
    <rect x="10" y="15" width="90" height="20" fill="#ddd" />
    <rect x="20" y="10" width="70" height="5" fill="#bbb" />
    <rect x="90" y="15" width="20" height="15" fill="#ddd" /> // Longer back
    <circle cx="25" cy="35" r="5" fill="#333" />
    <circle cx="85" cy="35" r="5" fill="#333" />
  </svg>
);

export default function PaintDamageAnalyzer() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    carMake: "",
    carModel: "",
    carYear: "",
    parkingType: "",
    washFrequency: "",
    currentDamage: [],
  });

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [paintData, setPaintData] = useState<Db | null>(null);
  const [makeSuggestions, setMakeSuggestions] = useState<string[]>([]);
  const [modelSuggestions, setModelSuggestions] = useState<string[]>([]);
  const [yearSuggestions, setYearSuggestions] = useState<string[]>([]);
  const [showMakeSuggestions, setShowMakeSuggestions] = useState(false);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);
  const [showYearSuggestions, setShowYearSuggestions] = useState(false);

  // Create refs for input fields
  const makeInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const yearInputRef = useRef<HTMLInputElement>(null);

  const calculateRiskScore = () => {
    setLoading(true);

    setTimeout(() => {
      const {
        carMake,
        carModel,
        carYear,
        parkingType,
        washFrequency,
        currentDamage,
      } = formData;
      let baseRisk = 30;
      let parkingRisk = 0;
      let washRisk = 0;
      let damageRisk = currentDamage.length * 5;
      let specificFactors: string[] = [];
      let additionalNotes: string | undefined;
      let vehicleSize = "Sedan"; // Default size
      if (!paintData) return;

      const data = paintData.paints;
      const paintInfo = data.find(
        (paint) =>
          paint.make === carMake &&
          paint.model === carModel &&
          paint.year === carYear
      );

      if (paintInfo) {
        baseRisk += paintInfo.paintRisk;
        vehicleSize = paintInfo.sizeCategory; // Get vehicle size
        if (paintInfo.notes) {
          specificFactors.push(paintInfo.notes);
        }
      } else {
        specificFactors.push(
          `No specific paint risk information was found for ${carMake} ${carModel} ${carYear}.`
        );
      }

      if (parkingType === "street") {
        parkingRisk = 20;
        specificFactors.push(
          "Street parking exposes your car to more environmental hazards."
        );
      } else if (parkingType === "uncovered") {
        parkingRisk = 15;
        specificFactors.push(
          "Uncovered parking increases sun and weather exposure."
        );
      } else {
        parkingRisk = 5;
        specificFactors.push(
          "Your parking situation offers some protection from the elements."
        );
      }

      if (washFrequency === "rarely") {
        washRisk = 15;
        specificFactors.push(
          "Infrequent washing allows contaminants to remain on the paint."
        );
      } else if (washFrequency === "monthly") {
        washRisk = 10;
        specificFactors.push(
          "Washing your car monthly helps, but more frequent washes could be beneficial."
        );
      } else {
        washRisk = 5;
        specificFactors.push(
          "You have good habits of washing your car regularly."
        );
      }

      if (currentDamage.length > 0) {
        specificFactors.push(
          `Your car shows signs of ${currentDamage.join(", ")}.`
        );
        if (currentDamage.includes("oxidation")) {
          additionalNotes = `Oxidation can spread quickly, it's crucial to address it soon.`;
        } else if (
          currentDamage.includes("scratches") &&
          currentDamage.includes("swirls")
        ) {
          additionalNotes = `The presence of both scratches and swirl marks suggest improper washing techniques may be in use.`;
        }
      } else {
        specificFactors.push("Your car currently has no visible paint damage.");
      }

      const sizeMultipliers = {
        Compact: 0.8,
        Sedan: 1.0,
        SUV: 1.2,
        Truck: 1.5,
        "Large Sedan": 1.1,
      };
      const sizeMultiplier = sizeMultipliers[vehicleSize] || 1.0;

      const totalRisk = Math.min(
        98,
        baseRisk + parkingRisk + washRisk + damageRisk
      );
      const monthlyLoss = (totalRisk / 100) * 100 * sizeMultiplier;
      const yearlyLoss = monthlyLoss * 12;
      const fiveYearLoss = yearlyLoss * 5;

      let urgencyLevel = "Moderate";
      if (totalRisk > 75) {
        urgencyLevel = "Critical";
      } else if (totalRisk > 50) {
        urgencyLevel = "High";
      }

      let recommendations = [
        "Professional Paint Correction",
        "Ceramic Coating Protection",
        "Regular Professional Maintenance",
      ];

      // Personalized Recommendations based on vehicle size
      if (vehicleSize === "Compact") {
        recommendations = [
          `For your ${vehicleSize} car, consider a high-quality carnauba wax for a balance of protection and shine.`,
          "Regular hand washing with pH-neutral soap to prevent swirl marks.",
          "Consider an entry-level ceramic spray for enhanced protection.",
        ];
      } else if (vehicleSize === "Sedan") {
        recommendations = [
          `To maintain the sleek look of your ${vehicleSize}, opt for a durable sealant or a hybrid wax.`,
          "Regular polishing to remove light swirl marks and maintain gloss.",
          "A professional ceramic coating will offer superior protection and longevity.",
        ];
      } else if (vehicleSize === "SUV") {
        recommendations = [
          `Given the size of your ${vehicleSize}, a robust ceramic coating is highly recommended for long-term protection.`,
          "Consider paint protection film (PPF) for high-impact areas like the front bumper and hood.",
          "Regular professional detailing to address larger surface area and maintain finish.",
        ];
      } else if (vehicleSize === "Truck") {
        recommendations = [
          `For maximum protection for your ${vehicleSize}, especially if used for work, consider a heavy-duty ceramic coating or PPF.`,
          "Regular cleaning to remove mud, dirt, and road grime, which can accelerate paint damage.",
          "Professional detailing services to manage the extensive surface area and maintain paint integrity.",
        ];
      } else if (vehicleSize === "Large Sedan") {
        recommendations = [
          `To preserve the luxury finish of your ${vehicleSize}, invest in a premium ceramic coating or high-end sealant.`,
          "Gentle hand washing and drying techniques are crucial to avoid swirl marks on larger panels.",
          "Regular professional detailing to maintain the pristine condition and address any imperfections promptly.",
        ];
      }

      setAnalysis({
        riskScore: totalRisk,
        monthlyLoss,
        yearlyLoss,
        fiveYearLoss,
        urgencyLevel,
        recommendations,
        damageProgression: {
          sixMonths: monthlyLoss * 6,
          oneYear: yearlyLoss,
          threeYears: yearlyLoss * 3,
        },
        specificFactors,
        additionalNotes,
        vehicleSize, // Pass vehicleSize to analysis
      });

      setLoading(false);
    }, 1500);
  };

  useEffect(() => {
    import("./db.json")
      .then((module) => {
        setPaintData(module as Db);
        if (module) {
          const allMakes = [
            ...new Set(module.paints.map((paint: PaintData) => paint.make)),
          ].sort();
          setMakeSuggestions(allMakes);
          const allYears = [
            ...new Set(module.paints.map((paint: PaintData) => paint.year)),
          ].sort();
          setYearSuggestions(allYears);
        }
      })
      .catch((error) => {
        console.error("Error loading db.json: ", error);
      });
  }, []);
  const handleMakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!paintData) return;
    const value = e.target.value;
    setFormData({ ...formData, carMake: value, carModel: "", carYear: "" });
    const inputEvent = e.nativeEvent as InputEvent;

    if (value === "" || inputEvent.inputType === "deleteContentBackward") {
      const allMakes = [
        ...new Set(paintData.paints.map((paint: PaintData) => paint.make)),
      ].sort();
      setMakeSuggestions(allMakes);
      setShowMakeSuggestions(true);
    } else {
      const filteredMakes = makeSuggestions
        .filter((make) => make.toLowerCase().startsWith(value.toLowerCase()))
        .sort();
      setMakeSuggestions(filteredMakes);
      setShowMakeSuggestions(true);
      if (filteredMakes.length === 1) {
        setFormData({
          ...formData,
          carMake: filteredMakes[0],
          carModel: "",
          carYear: "",
        });
        if (makeInputRef.current) {
          // Blur the make input field
          makeInputRef.current.blur();
        }
        setMakeSuggestions([]);
        setShowMakeSuggestions(false);
      }
    }
  };
  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!paintData) return;
    const value = e.target.value;
    setFormData({ ...formData, carModel: value, carYear: "" });
    const inputEvent = e.nativeEvent as InputEvent;

    if (value === "" || inputEvent.inputType === "deleteContentBackward") {
      const allModels = paintData.paints
        .filter((paint: PaintData) => paint.make === formData.carMake)
        .map((paint: PaintData) => paint.model)
        .sort();
      const uniqueModels = [...new Set(allModels)].sort();
      setModelSuggestions(uniqueModels);
      setShowModelSuggestions(true);
    } else {
      const filteredModels = modelSuggestions
        .filter((model) => model.toLowerCase().startsWith(value.toLowerCase()))
        .sort();
      setModelSuggestions(filteredModels);
      setShowModelSuggestions(true);
      if (filteredModels.length === 1) {
        setFormData({ ...formData, carModel: filteredModels[0], carYear: "" });
        if (modelInputRef.current) {
          // Blur the model input field
          modelInputRef.current.blur();
        }
        setModelSuggestions([]);
        setShowModelSuggestions(false);
      }
    }
  };
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!paintData) return;
    const value = e.target.value;
    setFormData({ ...formData, carYear: value });
    const inputEvent = e.nativeEvent as InputEvent;
    if (value === "" || inputEvent.inputType === "deleteContentBackward") {
      const allYears = paintData.paints
        .filter(
          (paint: PaintData) =>
            paint.make === formData.carMake && paint.model === formData.carModel
        )
        .map((paint: PaintData) => paint.year)
        .sort();
      const uniqueYears = [...new Set(allYears)].sort();
      setYearSuggestions(uniqueYears);
      setShowYearSuggestions(true);
    } else {
      const filteredYears = yearSuggestions
        .filter((year) => year.startsWith(value))
        .sort();
      setYearSuggestions(filteredYears);
      setShowYearSuggestions(true);
      if (filteredYears.length === 1) {
        setFormData({ ...formData, carYear: filteredYears[0] });
        if (yearInputRef.current) {
          // Blur the year input field
          yearInputRef.current.blur();
        }
        setYearSuggestions([]);
        setShowYearSuggestions(false);
      }
    }
  };
  const handleMakeFocus = () => {
    if (!paintData) return;
    const filteredMakes = makeSuggestions
      .filter((make) =>
        make.toLowerCase().startsWith(formData.carMake.toLowerCase())
      )
      .sort();
    setMakeSuggestions(filteredMakes);
    setShowMakeSuggestions(true);
    setModelSuggestions([]);
    setShowModelSuggestions(false);
    setYearSuggestions([]);
    setShowYearSuggestions(false);
  };
  const handleModelFocus = () => {
    if (!paintData) return;
    const allModels = paintData.paints
      .filter((paint: PaintData) => paint.make === formData.carMake)
      .map((paint: PaintData) => paint.model)
      .sort();
    const uniqueModels = [...new Set(allModels)].sort();
    const filteredModels = uniqueModels
      .filter((model) =>
        model.toLowerCase().startsWith(formData.carModel.toLowerCase())
      )
      .sort();
    setModelSuggestions(filteredModels);
    setShowModelSuggestions(true);
    setYearSuggestions([]);
    setShowYearSuggestions(false);
  };
  const handleYearFocus = () => {
    if (!paintData) return;
    const allYears = paintData.paints
      .filter(
        (paint: PaintData) =>
          paint.make === formData.carMake && paint.model === formData.carModel
      )
      .map((paint: PaintData) => paint.year)
      .sort();
    const uniqueYears = [...new Set(allYears)].sort();
    const filteredYears = uniqueYears
      .filter((year) => year.startsWith(formData.carYear))
      .sort();
    setYearSuggestions(filteredYears);
    setShowYearSuggestions(true);
  };
  const selectMakeSuggestion = (suggestion: string) => {
    setFormData({
      ...formData,
      carMake: suggestion,
      carModel: "",
      carYear: "",
    });
    if (makeInputRef.current) {
      // Blur the make input field
      makeInputRef.current.blur();
    }
    setMakeSuggestions([]);
    setShowMakeSuggestions(false);
    if (!paintData) return;
    const allModels = paintData.paints
      .filter((paint: PaintData) => paint.make === suggestion)
      .map((paint: PaintData) => paint.model)
      .sort();
    const uniqueModels = [...new Set(allModels)].sort();
    setModelSuggestions(uniqueModels);
    setYearSuggestions(
      [
        ...new Set(paintData.paints.map((paint: PaintData) => paint.year)),
      ].sort()
    );
  };
  const selectModelSuggestion = (suggestion: string) => {
    setFormData({ ...formData, carModel: suggestion, carYear: "" });
    if (modelInputRef.current) {
      // Blur the model input field
      modelInputRef.current.blur();
    }
    setModelSuggestions([]);
    setShowModelSuggestions(false);
    if (!paintData) return;
    const allYears = paintData.paints
      .filter(
        (paint: PaintData) =>
          paint.make === formData.carMake && paint.model === suggestion
      )
      .map((paint: PaintData) => paint.year)
      .sort();
    const uniqueYears = [...new Set(allYears)].sort();
    setYearSuggestions(uniqueYears);
  };
  const selectYearSuggestion = (suggestion: string) => {
    setFormData({ ...formData, carYear: suggestion });
    if (yearInputRef.current) {
      // Blur the year input field
      yearInputRef.current.blur();
    }
    setYearSuggestions([]);
    setShowYearSuggestions(false);
  };
  const handleMakeBlur = () => {
    setTimeout(() => {
      setShowMakeSuggestions(false);
      if (paintData) {
        setMakeSuggestions(
          [
            ...new Set(paintData.paints.map((paint: PaintData) => paint.make)),
          ].sort()
        );
      }
    }, 150);
  };

  const handleModelBlur = () => {
    setTimeout(() => {
      setShowModelSuggestions(false);
    }, 150);
  };

  const handleYearBlur = () => {
    setTimeout(() => {
      setShowYearSuggestions(false);
      if (paintData) {
        setYearSuggestions(
          [
            ...new Set(paintData.paints.map((paint: PaintData) => paint.year)),
          ].sort()
        );
      }
    }, 150);
  };
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 relative">
            <h2 className="text-2xl font-bold text-gray-800">
              Tell us about your vehicle
            </h2>
            <div className="grid gap-4">
              <div className="relative">
                <input
                  ref={makeInputRef} // Attach ref to Make input
                  type="text"
                  placeholder="Car Make (e.g., BMW, Mercedes)"
                  className="w-full p-4 border rounded-lg"
                  value={formData.carMake}
                  onChange={handleMakeChange}
                  onFocus={handleMakeFocus}
                  onBlur={handleMakeBlur}
                />
                {showMakeSuggestions && makeSuggestions.length > 0 && (
                  <div>
                    <ul className="absolute mt-1 w-full bg-white border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                      {makeSuggestions.map((suggestion) => (
                        <li
                          key={suggestion}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => selectMakeSuggestion(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="relative">
                <input
                  ref={modelInputRef} // Attach ref to Model input
                  type="text"
                  placeholder="Model (e.g., 3 Series, C-Class)"
                  className="w-full p-4 border rounded-lg"
                  value={formData.carModel}
                  onChange={handleModelChange}
                  onFocus={handleModelFocus}
                  onBlur={handleModelBlur}
                />
                {showModelSuggestions && modelSuggestions.length > 0 && (
                  <div>
                    <ul className="absolute mt-1 w-full bg-white border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                      {modelSuggestions.map((suggestion) => (
                        <li
                          key={suggestion}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => selectModelSuggestion(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="relative">
                <input
                  ref={yearInputRef} // Attach ref to Year input
                  type="text"
                  placeholder="Year"
                  className="w-full p-4 border rounded-lg"
                  value={formData.carYear}
                  onChange={handleYearChange}
                  onFocus={handleYearFocus}
                  onBlur={handleYearBlur}
                />
                {showYearSuggestions && yearSuggestions.length > 0 && (
                  <div>
                    <ul className="absolute mt-1 w-full bg-white border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                      {yearSuggestions.map((suggestion) => (
                        <li
                          key={suggestion}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => selectYearSuggestion(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <button
              className="w-full p-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              onClick={() => setStep(2)}
            >
              <ChevronRight className="w-5 h-5" />
              Continue
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Environmental Factors
            </h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Parking Situation
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Garage", "Covered", "Uncovered", "Street"].map((type) => (
                    <button
                      key={type}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.parkingType === type.toLowerCase()
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          parkingType: type.toLowerCase(),
                        })
                      }
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  How often do you wash your car?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Rarely", "Monthly", "Weekly"].map((frequency) => (
                    <button
                      key={frequency}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.washFrequency === frequency.toLowerCase()
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          washFrequency: frequency.toLowerCase(),
                        })
                      }
                    >
                      {frequency}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              className="w-full p-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              onClick={() => setStep(3)}
            >
              Continue
            </button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Current Paint Condition
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">Select all that apply:</p>
              <div className="grid grid-cols-2 gap-3">
                {damageTypes.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    className={`p-4 rounded-lg border-2 transition-all flex items-center gap-2 ${
                      formData.currentDamage.includes(id)
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => {
                      const newDamage = formData.currentDamage.includes(id)
                        ? formData.currentDamage.filter((d) => d !== id)
                        : [...formData.currentDamage, id];
                      setFormData({ ...formData, currentDamage: newDamage });
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="w-full p-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              onClick={calculateRiskScore}
            >
              <Zap className="w-5 h-5" />
              Generate Risk Report
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-b from-white to-blue-50">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Shield className="text-blue-600 w-20 h-20" />
            <AlertTriangle className="text-red-500 w-10 h-10 absolute -right-2 -bottom-2" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Paint Damage Risk Analyzer™
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Discover Hidden Paint Damage & Value Loss
        </p>
        <div className="flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600">2-Minute Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600">Professional Grade</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg">
        {!analysis ? (
          <div>
            <div className="flex justify-between mb-8">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step === num ? "bg-blue-600 text-white" : "bg-gray-200"
                    }`}
                  >
                    {num}
                  </div>
                  {num < 3 && (
                    <div
                      className={`w-24 h-1 ${
                        step > num ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">
                  Analyzing your vehicle's risk factors...
                </p>
              </div>
            ) : (
              renderStep()
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Paint Damage Risk Score™
                </h2>
                <div className="text-4xl font-bold text-red-600">
                  {analysis.riskScore}/100
                </div>
              </div>
              {/* Vehicle SVG Rendering */}
              <div className="flex justify-center mb-4">
                {analysis.vehicleSize === "Sedan" && <SedanSVG />}
                {analysis.vehicleSize === "SUV" && <SUVSVG />}
                {analysis.vehicleSize === "Truck" && <TruckSVG />}
                {analysis.vehicleSize === "Compact" && <CompactSVG />}
                {analysis.vehicleSize === "Large Sedan" && <LargeSedanSVG />}
                {!analysis.vehicleSize && <SedanSVG />}{" "}
                {/* Default if no size */}
              </div>
              <div className="p-4 bg-white rounded-lg mb-4">
                <div className="text-lg font-semibold text-red-600 mb-2">
                  Urgency Level: {analysis.urgencyLevel}
                </div>
                <p className="text-gray-600">
                  Based on your inputs, your car is showing a{" "}
                  <b>{analysis.urgencyLevel}</b> level of paint deterioration
                  risk.
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg mb-4">
                <h3 className="font-semibold mb-2 text-gray-800">
                  Key Factors Impacting Your Risk
                </h3>
                <ul className="list-disc list-inside text-gray-600">
                  {analysis.specificFactors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
                {analysis.additionalNotes && (
                  <p className="mt-2 text-gray-700 font-medium">
                    {analysis.additionalNotes}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    ${Math.round(analysis.monthlyLoss)}
                  </div>
                  <div className="text-sm text-gray-600">Monthly Loss</div>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    ${Math.round(analysis.yearlyLoss)}
                  </div>
                  <div className="text-sm text-gray-600">Yearly Loss</div>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    ${Math.round(analysis.fiveYearLoss)}
                  </div>
                  <div className="text-sm text-gray-600">5-Year Loss</div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-blue-50 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">
                Projected Damage Progression
              </h3>
              <div className="space-y-3">
                {Object.entries(analysis.damageProgression).map(
                  ([period, value]: [string, number]) => (
                    <div key={period} className="flex items-center gap-4">
                      <div className="w-32 font-medium">
                        {period.replace(/([A-Z])/g, " $1").toLowerCase()}:
                      </div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 transition-all duration-1000"
                          style={{
                            width: `${(value / analysis.fiveYearLoss) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="w-24 text-right font-semibold text-red-600">
                        ${Math.round(value)}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="p-6 bg-green-50 rounded-lg">
              <h3 className="text-xl font-semibold text-green-800 mb-4">
                Recommendations
              </h3>
              <ul className="list-disc list-inside text-gray-700">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
            <button className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-semibold transition-colors flex items-center justify-center gap-2">
              <Shield className="w-6 h-6" />
              Get Your Free Protection Consultation
            </button>
            <p className="text-center text-sm text-gray-500">
              🎁 LIMITED TIME: First 10 consultations today include a free paint
              analysis ($99 value)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
