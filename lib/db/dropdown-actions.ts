import { getDb } from './index';
import { dropdown_options } from './schema';
import { eq } from 'drizzle-orm';

export async function insertDropdownOption(category: string, optionValue: string) {
  const db = getDb();
  try {
    await db.insert(dropdown_options).values({ category, option_value: optionValue });
  } catch (error) {
    console.error(`Error inserting dropdown option (category: ${category}, value: ${optionValue}):`, error);
    throw error; // Re-throw the error to ensure it's propagated
  }
}

export async function getDropdownOptions(category?: string) {
  const db = getDb();
  try {
    if (category) {
      return await db.select().from(dropdown_options).where(eq(dropdown_options.category, category));
    }
    return await db.select().from(dropdown_options);
  } catch (error) {
    console.error(`Error fetching dropdown options for category '${category || "all"}':`, error);
    throw error; // Re-throw the error
  }
}

export async function hasDropdownOptions(category: string): Promise<boolean> {
  const db = getDb();
  try {
    const result = await db.select().from(dropdown_options).where(eq(dropdown_options.category, category)).limit(1);
    return result.length > 0;
  } catch (error) {
    console.error(`Error checking for dropdown options for category '${category}':`, error);
    throw error; // Re-throw the error
  }
} 