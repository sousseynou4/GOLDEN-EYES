"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Send, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import {
  bookingSchema,
  PRESTATION_TYPES,
  BUDGET_RANGES,
  type BookingInput,
} from "@/lib/validations/booking";

/**
 * Formulaire de réservation client (thème clair).
 * Validation Zod côté client + re-validation serveur dans /api/bookings.
 * Déclenche l'envoi d'emails (client + admin) côté serveur.
 */
export function BookingForm() {
  const [submitted, setSubmitted] = useState(false);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      adresse: "",
      date_evenement: "",
      type_prestation: undefined,
      nombre_personnes: undefined,
      budget: "",
      lieu: "",
      message: "",
    },
  });

  async function onSubmit(values: BookingInput) {
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Erreur lors de l'envoi");
      }
      toast.success("Votre demande a bien été envoyée !", {
        description: "Je reviens vers vous sous 48h.",
      });
      reset();
      setSubmitted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inattendue";
      toast.error("Impossible d'envoyer le formulaire", { description: message });
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center py-10 text-center"
      >
        <CheckCircle2 className="h-14 w-14 text-gold-600" />
        <h3 className="mt-6 font-serif text-3xl text-espresso">Demande reçue</h3>
        <p className="mt-3 max-w-sm text-ink-muted">
          Merci pour votre confiance. Vous allez recevoir un email de
          confirmation, et je vous recontacte personnellement sous 48 heures.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 text-xs uppercase tracking-wider text-gold-600 underline-offset-4 hover:underline"
        >
          Envoyer une autre demande
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Identité */}
      <div className="grid gap-5 md:grid-cols-2">
        <Input label="Nom" required autoComplete="family-name" placeholder="Dupont"
          error={errors.nom?.message} {...register("nom")} />
        <Input label="Prénom" required autoComplete="given-name" placeholder="Jean"
          error={errors.prenom?.message} {...register("prenom")} />
      </div>

      {/* Contact */}
      <div className="grid gap-5 md:grid-cols-2">
        <Input label="Email" type="email" required autoComplete="email"
          placeholder="jean.dupont@email.fr" error={errors.email?.message} {...register("email")} />
        <Input label="Téléphone" type="tel" required autoComplete="tel"
          placeholder="06 12 34 56 78" error={errors.telephone?.message} {...register("telephone")} />
      </div>

      {/* Type de prestation + Date */}
      <div className="grid gap-5 md:grid-cols-2">
        <Select
          label="Type de prestation"
          required
          placeholder="Choisissez…"
          options={PRESTATION_TYPES.map((p) => ({ value: p.value, label: p.label }))}
          error={errors.type_prestation?.message}
          {...register("type_prestation")}
        />
        <Input label="Date souhaitée" type="date" required min={tomorrow}
          error={errors.date_evenement?.message} {...register("date_evenement")} />
      </div>

      {/* Lieu + Nombre de personnes */}
      <div className="grid gap-5 md:grid-cols-2">
        <Input label="Lieu / ville" placeholder="Paris, Lyon, à domicile…"
          hint="Optionnel" error={errors.lieu?.message} {...register("lieu")} />
        <Input label="Nombre de personnes" type="number" min={1}
          placeholder="Ex : 80 invités" hint="Optionnel"
          error={errors.nombre_personnes?.message} {...register("nombre_personnes")} />
      </div>

      {/* Budget + Adresse */}
      <div className="grid gap-5 md:grid-cols-2">
        <Select
          label="Budget approximatif"
          placeholder="Non précisé"
          options={BUDGET_RANGES.map((b) => ({ value: b, label: b }))}
          hint="Optionnel"
          error={errors.budget?.message}
          {...register("budget")}
        />
        <Input label="Adresse" autoComplete="street-address"
          placeholder="Utile pour les reportages à domicile" hint="Optionnel"
          error={errors.adresse?.message} {...register("adresse")} />
      </div>

      {/* Message */}
      <Textarea label="Votre projet" required rows={6}
        placeholder="Décrivez votre projet, l'ambiance recherchée, vos attentes…"
        hint="Plus de détails = meilleure préparation"
        error={errors.message?.message} {...register("message")} />

      <p className="text-xs leading-relaxed text-ink-faint">
        En soumettant ce formulaire, vous acceptez que vos données soient
        utilisées uniquement pour traiter votre demande. Aucune communication
        commerciale, aucune cession à des tiers.
      </p>

      <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
        {!isSubmitting && <Send className="h-4 w-4" />}
        {isSubmitting ? "Envoi en cours…" : "Envoyer ma demande"}
      </Button>
    </form>
  );
}
