import { z } from 'zod';
import { UPDATE_PROFILE_SHEET } from '../constants/update-profile.constants';

const FRENCH_PHONE_REGEX =
  /^(?:(?:\+33|0033)\s?[1-9](?:[\s.-]?\d{2}){4}|0[1-9](?:[\s.-]?\d{2}){4})$/;

export const getUpdateProfileSchema = () =>
  z.object({
    firstName: z
      .string()
      .trim()
      .min(1, UPDATE_PROFILE_SHEET.ERRORS.FIRST_NAME_REQUIRED)
      .max(100, UPDATE_PROFILE_SHEET.ERRORS.FIRST_NAME_MAX),

    lastName: z
      .string()
      .trim()
      .min(1, UPDATE_PROFILE_SHEET.ERRORS.LAST_NAME_REQUIRED)
      .max(100, UPDATE_PROFILE_SHEET.ERRORS.LAST_NAME_MAX),

    phone: z
      .string()
      .trim()
      .max(30, UPDATE_PROFILE_SHEET.ERRORS.PHONE_MAX)
      .refine(
        (value) => value === '' || FRENCH_PHONE_REGEX.test(value),
        UPDATE_PROFILE_SHEET.ERRORS.PHONE_INVALID,
      ),
  });

export type UpdateProfileSchemaType = z.infer<
  ReturnType<typeof getUpdateProfileSchema>
>;
