"use client";

import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { sendMessage } from "@/app/(site)/(book)/get-involved/actions";
import type { contactForm } from "@/content/pages";
import {
  contactLimits,
  type ContactField,
  type ContactState,
} from "@/lib/contact";

type ContactFormProps = {
  /** The form's words, from src/content/pages.ts. */
  copy: typeof contactForm;
  /** Where to write instead, if the message cannot be sent. */
  email: string;
};

const initial: ContactState = { status: "idle" };

// False on the server and while the page hydrates, true once React runs it.
const noSubscription = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );

/**
 * The contact form on Get Involved. It is a real form: without JavaScript
 * it posts to the server, which sends the message and shows a page for the
 * outcome. Once the page has loaded, the outcome shows here instead, and
 * what was written stays in the form if it could not be sent.
 */
export function ContactForm({ copy, email }: ContactFormProps) {
  const [state, action, pending] = useActionState(sendMessage, initial);
  const hydrated = useHydrated();
  const formRef = useRef<HTMLFormElement>(null);
  const id = useId();
  const values = state.values;
  const errors = state.errors ?? {};

  // After a failed send, start again at the first thing to fix.
  useEffect(() => {
    if (state.status !== "invalid") return;
    formRef.current
      ?.querySelector<HTMLElement>("[aria-invalid='true']")
      ?.focus();
  }, [state]);

  if (state.status === "sent") {
    return (
      <p
        ref={(node) => node?.focus()}
        tabIndex={-1}
        role="status"
        className="contact-form__sent"
      >
        {copy.sent.body}
      </p>
    );
  }

  const field = (name: ContactField) => ({
    id: `${id}-${name}`,
    name,
    maxLength: contactLimits[name],
    defaultValue: values?.[name] ?? "",
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
  });

  return (
    <form ref={formRef} action={action} className="contact-form">
      {hydrated && <input type="hidden" name="enhanced" value="1" />}

      <fieldset
        aria-describedby={errors.topic ? `${id}-topic-error` : undefined}
      >
        <legend className="contact-form__label">{copy.topic.legend}</legend>
        <div className="contact-form__options">
          {copy.topic.options.map((option) => (
            <label key={option.value} className="contact-form__option">
              <input
                type="radio"
                name="topic"
                value={option.value}
                required
                defaultChecked={values?.topic === option.value}
              />
              {option.label}
            </label>
          ))}
        </div>
        <FieldError id={`${id}-topic-error`}>{errors.topic}</FieldError>
      </fieldset>

      <div className="contact-form__row">
        <Field id={`${id}-name`} label={copy.fields.name}>
          <input {...field("name")} type="text" autoComplete="name" required />
          <FieldError id={`${id}-name-error`}>{errors.name}</FieldError>
        </Field>
        <Field id={`${id}-email`} label={copy.fields.email}>
          <input
            {...field("email")}
            type="email"
            autoComplete="email"
            required
          />
          <FieldError id={`${id}-email-error`}>{errors.email}</FieldError>
        </Field>
      </div>

      <div className="contact-form__row">
        <Field
          id={`${id}-phone`}
          label={copy.fields.phone}
          optional={copy.optional}
        >
          <input {...field("phone")} type="tel" autoComplete="tel" />
          <FieldError id={`${id}-phone-error`}>{errors.phone}</FieldError>
        </Field>
        <Field
          id={`${id}-city`}
          label={copy.fields.city}
          optional={copy.optional}
        >
          <input {...field("city")} type="text" autoComplete="address-level2" />
          <FieldError id={`${id}-city-error`}>{errors.city}</FieldError>
        </Field>
      </div>

      <Field id={`${id}-message`} label={copy.fields.message}>
        <p id={`${id}-message-hint`} className="contact-form__hint">
          {copy.messageHint}
        </p>
        <textarea
          {...field("message")}
          rows={6}
          required
          aria-describedby={
            [`${id}-message-hint`, errors.message && `${id}-message-error`]
              .filter(Boolean)
              .join(" ") || undefined
          }
        />
        <FieldError id={`${id}-message-error`}>{errors.message}</FieldError>
      </Field>

      {/* For bots only: people never see it, so anything in it is spam. */}
      <div aria-hidden="true" className="contact-form__trap">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === "unsent" && (
        <p role="alert" className="contact-form__problem">
          {copy.unsent.body} <a href={`mailto:${email}`}>{email}</a>.{" "}
          {copy.unsent.kept}
        </p>
      )}

      <button type="submit" disabled={pending} className="contact-form__send">
        {pending ? copy.sending : copy.send}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  optional,
  children,
}: {
  id: string;
  label: string;
  optional?: string;
  children: ReactNode;
}) {
  return (
    <div className="contact-form__field">
      <label htmlFor={id} className="contact-form__label">
        {label}
        {optional && (
          <span className="contact-form__optional"> ({optional})</span>
        )}
      </label>
      {children}
    </div>
  );
}

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="contact-form__error">
      {children}
    </p>
  );
}
