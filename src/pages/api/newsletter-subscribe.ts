export const prerender = false;
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const cfEnv = (locals as any).runtime?.env ?? {};
    const AC_API_URL = cfEnv.AC_API_URL || import.meta.env.AC_API_URL;
    const AC_API_KEY = cfEnv.AC_API_KEY || import.meta.env.AC_API_KEY;

    if (!AC_API_URL || !AC_API_KEY) {
      throw new Error('ActiveCampaign credentials not configured');
    }

    const { prenume, email, marketing, tag } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email lipsă' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const headers = {
      'Api-Token': AC_API_KEY,
      'Content-Type': 'application/json',
    };

    // 1. Creează / sincronizează contactul
    const contactRes = await fetch(`${AC_API_URL}/api/3/contact/sync`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        contact: { email, firstName: prenume || '' },
      }),
    });
    const contactJson = await contactRes.json() as { contact?: { id: string } };
    const contactId = contactJson.contact?.id;

    if (!contactId) throw new Error('AC contact sync failed');

    // 2. Setează câmpul Sursa Lead (field 24)
    await fetch(`${AC_API_URL}/api/3/fieldValues`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        fieldValue: { contact: contactId, field: '24', value: tag || 'newsletter' },
      }),
    });

    // 3. Setează câmpul Consimțământ Marketing (field 25) dacă există bifa
    if (marketing === 'on' || marketing === true || marketing === 'true') {
      await fetch(`${AC_API_URL}/api/3/fieldValues`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fieldValue: { contact: contactId, field: '25', value: 'da' },
        }),
      });
    }

    // 4. Adaugă la lista "Website Leads" (ID: 4)
    await fetch(`${AC_API_URL}/api/3/contactLists`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        contactList: { list: '4', contact: contactId, status: '1' },
      }),
    });

    // 5. Aplică tag-uri
    const tagNames: string[] = [];
    if (tag) tagNames.push(tag);
    if (marketing === 'on' || marketing === true || marketing === 'true') {
      tagNames.push('acord-marketing');
    }

    for (const tagName of tagNames) {
      const searchRes = await fetch(
        `${AC_API_URL}/api/3/tags?search=${encodeURIComponent(tagName)}`,
        { headers }
      );
      const searchJson = await searchRes.json() as { tags?: { id: string }[] };

      let tagId: string = '';
      if (searchJson.tags && searchJson.tags.length > 0) {
        tagId = searchJson.tags[0].id;
      } else {
        const createTagRes = await fetch(`${AC_API_URL}/api/3/tags`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ tag: { tag: tagName, tagType: 'contact' } }),
        });
        const createTagJson = await createTagRes.json() as { tag?: { id: string } };
        tagId = createTagJson.tag?.id ?? '';
      }

      if (tagId) {
        await fetch(`${AC_API_URL}/api/3/contactTags`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ contactTag: { contact: contactId, tag: tagId } }),
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[newsletter-subscribe] error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
