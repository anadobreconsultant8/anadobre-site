interface ACContactData {
  prenume: string;
  email: string;
  companie: string;
  scor: number;
  nivel: string;
  apiUrl: string;
  apiKey: string;
}

export async function createACContact(data: ACContactData) {
  const AC_API_URL = data.apiUrl;
  const AC_API_KEY = data.apiKey;

  if (!AC_API_URL || !AC_API_KEY) {
    console.error('AC credentials missing');
    throw new Error('ActiveCampaign credentials not configured');
  }

  const headers = {
    'Api-Token': AC_API_KEY,
    'Content-Type': 'application/json',
  };

  // 1. Creează sau actualizează contactul
  const contactRes = await fetch(`${AC_API_URL}/api/3/contact/sync`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      contact: {
        email: data.email,
        firstName: data.prenume,
      }
    }),
  });

  const contactJson = await contactRes.json() as { contact?: { id: string } };
  const contactId = contactJson.contact?.id;

  if (!contactId) {
    throw new Error('Failed to create/sync AC contact');
  }

  // 2. Setează câmpurile custom
  // field 22 = Scor Mini-Audit, 23 = Nivel Mini-Audit, 15 = Companie, 24 = Sursa Lead
  const fieldValues = [
    { field: '22', value: String(data.scor) },
    { field: '23', value: data.nivel },
    { field: '15', value: data.companie },
    { field: '24', value: 'mini-audit' },
  ];

  for (const fv of fieldValues) {
    await fetch(`${AC_API_URL}/api/3/fieldValues`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        fieldValue: {
          contact: contactId,
          field: fv.field,
          value: fv.value,
        }
      }),
    });
  }

  // 3. Adaugă la lista "Website Leads" (ID: 4)
  await fetch(`${AC_API_URL}/api/3/contactLists`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      contactList: {
        list: '4',
        contact: contactId,
        status: '1',
      }
    }),
  });

  // 4. Aplică tag-uri: mini-audit + tag nivel
  const tagNames = ['mini-audit'];
  if (data.nivel === '\u00CEncep\u0103tor') {
    tagNames.push('audit-beginner');
  } else if (data.nivel === 'Intermediar') {
    tagNames.push('audit-intermediate');
  } else if (data.nivel === 'Avansat') {
    tagNames.push('audit-advanced');
  }

  for (const tagName of tagNames) {
    const searchRes = await fetch(
      `${AC_API_URL}/api/3/tags?search=${encodeURIComponent(tagName)}`,
      { headers }
    );
    const searchJson = await searchRes.json() as { tags?: { id: string }[] };

    let tagId: string;

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
        body: JSON.stringify({
          contactTag: { contact: contactId, tag: tagId }
        }),
      });
    }
  }

  return contactId;
}
