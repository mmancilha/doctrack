import { TFunction } from "i18next";

export function getTemplateForCategory(
  category: string,
  t: TFunction<"documents", undefined>
): string {
  const templates: Record<string, string> = {
    manual: `<h1>${t("templates.manual.title")}</h1>
<p>${t("templates.manual.intro")}</p>

<h2>${t("templates.manual.section1.title")}</h2>
<p>${t("templates.manual.section1.content")}</p>

<h2>${t("templates.manual.section2.title")}</h2>
<p>${t("templates.manual.section2.content")}</p>
<ul>
  <li>${t("templates.manual.section2.item1")}</li>
  <li>${t("templates.manual.section2.item2")}</li>
  <li>${t("templates.manual.section2.item3")}</li>
</ul>

<h2>${t("templates.manual.section3.title")}</h2>
<p>${t("templates.manual.section3.content")}</p>`,

    checklist: `<h1>${t("templates.checklist.title")}</h1>
<p>${t("templates.checklist.intro")}</p>

<h2>${t("templates.checklist.section1.title")}</h2>
<ul>
  <li>□ ${t("templates.checklist.section1.item1")}</li>
  <li>□ ${t("templates.checklist.section1.item2")}</li>
  <li>□ ${t("templates.checklist.section1.item3")}</li>
  <li>□ ${t("templates.checklist.section1.item4")}</li>
  <li>□ ${t("templates.checklist.section1.item5")}</li>
</ul>

<h2>${t("templates.checklist.section2.title")}</h2>
<ul>
  <li>□ ${t("templates.checklist.section2.item1")}</li>
  <li>□ ${t("templates.checklist.section2.item2")}</li>
  <li>□ ${t("templates.checklist.section2.item3")}</li>
</ul>

<h2>${t("templates.checklist.notes.title")}</h2>
<p>${t("templates.checklist.notes.content")}</p>`,

    guide: `<h1>${t("templates.guide.title")}</h1>
<p>${t("templates.guide.intro")}</p>

<h2>${t("templates.guide.overview.title")}</h2>
<p>${t("templates.guide.overview.content")}</p>

<h2>${t("templates.guide.steps.title")}</h2>
<ol>
  <li>${t("templates.guide.steps.step1")}</li>
  <li>${t("templates.guide.steps.step2")}</li>
  <li>${t("templates.guide.steps.step3")}</li>
  <li>${t("templates.guide.steps.step4")}</li>
</ol>

<h2>${t("templates.guide.tips.title")}</h2>
<p>• ${t("templates.guide.tips.tip1")}</p>
<p>• ${t("templates.guide.tips.tip2")}</p>
<p>• ${t("templates.guide.tips.tip3")}</p>
<p>• ${t("templates.guide.tips.tip4")}</p>

<h2>${t("templates.guide.troubleshooting.title")}</h2>
<p>${t("templates.guide.troubleshooting.content")}</p>
<ul>
  <li>${t("templates.guide.troubleshooting.item1")}</li>
  <li>${t("templates.guide.troubleshooting.item2")}</li>
</ul>`,

    confidentiality: `<h1>${t("templates.confidentiality.title")}</h1>
<p>${t("templates.confidentiality.intro")}</p>

<h2>${t("templates.confidentiality.parties.title")}</h2>
<p><strong>${t("templates.confidentiality.parties.disclosing")}:</strong> [${t("templates.confidentiality.parties.companyName")}]</p>
<p><strong>${t("templates.confidentiality.parties.receiving")}:</strong> [${t("templates.confidentiality.parties.clientName")}]</p>

<h2>${t("templates.confidentiality.section1.title")}</h2>
<p>${t("templates.confidentiality.section1.content")}</p>
<p>${t("templates.confidentiality.section1.detail")}</p>

<h2>${t("templates.confidentiality.section2.title")}</h2>
<p>${t("templates.confidentiality.section2.content")}</p>
<ul>
  <li>${t("templates.confidentiality.section2.item1")}</li>
  <li>${t("templates.confidentiality.section2.item2")}</li>
  <li>${t("templates.confidentiality.section2.item3")}</li>
  <li>${t("templates.confidentiality.section2.item4")}</li>
</ul>

<h2>${t("templates.confidentiality.section3.title")}</h2>
<p>${t("templates.confidentiality.section3.content")}</p>
<p>${t("templates.confidentiality.section3.detail")}</p>

<h2>${t("templates.confidentiality.section4.title")}</h2>
<p>${t("templates.confidentiality.section4.content")}</p>

<h2>${t("templates.confidentiality.section5.title")}</h2>
<p>_________________________</p>
<p><strong>${t("templates.confidentiality.parties.disclosing")}:</strong> [${t("templates.confidentiality.section5.nameSignature")}]</p>
<p>${t("templates.confidentiality.section5.date")}: _______________</p>

<p>_________________________</p>
<p><strong>${t("templates.confidentiality.parties.receiving")}:</strong> [${t("templates.confidentiality.section5.nameSignature")}]</p>
<p>${t("templates.confidentiality.section5.date")}: _______________</p>`,

    proposal: `<h1>${t("templates.proposal.title")}</h1>
<p>${t("templates.proposal.intro")}</p>

<h2>${t("templates.proposal.executive.title")}</h2>
<p>${t("templates.proposal.executive.content")}</p>
<p>${t("templates.proposal.executive.detail")}</p>

<h2>${t("templates.proposal.section1.title")}</h2>
<p>${t("templates.proposal.section1.content")}</p>
<ul>
  <li>${t("templates.proposal.section1.item1")}</li>
  <li>${t("templates.proposal.section1.item2")}</li>
  <li>${t("templates.proposal.section1.item3")}</li>
  <li>${t("templates.proposal.section1.item4")}</li>
</ul>

<h2>${t("templates.proposal.section2.title")}</h2>
<p>${t("templates.proposal.section2.content")}</p>
<ul>
  <li>${t("templates.proposal.section2.item1")}</li>
  <li>${t("templates.proposal.section2.item2")}</li>
  <li>${t("templates.proposal.section2.item3")}</li>
  <li>${t("templates.proposal.section2.item4")}</li>
</ul>
<p>${t("templates.proposal.section2.detail")}</p>

<h2>${t("templates.proposal.section3.title")}</h2>
<p><strong>${t("templates.proposal.section3.total")}:</strong> ${t("templates.proposal.section3.amount")}</p>
<p><strong>${t("templates.proposal.section3.payment")}:</strong> [${t("templates.proposal.section3.details")}]</p>
<p>${t("templates.proposal.section3.note")}</p>

<h2>${t("templates.proposal.section4.title")}</h2>
<p>${t("templates.proposal.section4.intro")}</p>
<ul>
  <li>${t("templates.proposal.section4.phase1")}</li>
  <li>${t("templates.proposal.section4.phase2")}</li>
  <li>${t("templates.proposal.section4.phase3")}</li>
</ul>

<h2>${t("templates.proposal.section5.title")}</h2>
<p>${t("templates.proposal.section5.content")}</p>
<ol>
  <li>${t("templates.proposal.section5.item1")}</li>
  <li>${t("templates.proposal.section5.item2")}</li>
  <li>${t("templates.proposal.section5.item3")}</li>
</ol>
<p>${t("templates.proposal.section5.closing")}</p>`,

    contract: `<h1>${t("templates.contract.title")}</h1>

<h2>${t("templates.contract.parties.title")}</h2>
<p><strong>${t("templates.contract.parties.contractor")}:</strong> [${t("templates.contract.parties.companyName")}], ${t("templates.contract.parties.cnpj")} [${t("templates.contract.parties.cnpjNumber")}]</p>
<p><strong>${t("templates.contract.parties.contracted")}:</strong> [${t("templates.contract.parties.clientName")}], ${t("templates.contract.parties.document")} [${t("templates.contract.parties.documentNumber")}]</p>

<h2>${t("templates.contract.section1.title")}</h2>
<p>${t("templates.contract.section1.content")}</p>

<h2>${t("templates.contract.section2.title")}</h2>
<p>${t("templates.contract.section2.content")}</p>

<h2>${t("templates.contract.section3.title")}</h2>
<p><strong>${t("templates.contract.section3.total")}:</strong> ${t("templates.contract.section3.amount")}</p>
<p><strong>${t("templates.contract.section3.payment")}:</strong> [${t("templates.contract.section3.details")}]</p>

<h2>${t("templates.contract.section4.title")}</h2>
<ul>
  <li>${t("templates.contract.section4.item1")}</li>
  <li>${t("templates.contract.section4.item2")}</li>
</ul>

<h2>${t("templates.contract.section5.title")}</h2>
<ul>
  <li>${t("templates.contract.section5.item1")}</li>
  <li>${t("templates.contract.section5.item2")}</li>
</ul>

<h2>${t("templates.contract.section6.title")}</h2>
<p>${t("templates.contract.section6.content")}</p>

<h2>${t("templates.contract.section7.title")}</h2>
<p>${t("templates.contract.section7.content")}</p>

<h2>${t("templates.contract.section8.title")}</h2>
<p>_________________________</p>
<p>[${t("templates.contract.section8.contractor")}]</p>
<p>${t("templates.contract.section8.date")}: _______________</p>

<p>_________________________</p>
<p>[${t("templates.contract.section8.contracted")}]</p>
<p>${t("templates.contract.section8.date")}: _______________</p>`,

    policy: `<h1>${t("templates.policy.title")}</h1>

<h2>${t("templates.policy.section1.title")}</h2>
<p>${t("templates.policy.section1.content")}</p>

<h2>${t("templates.policy.section2.title")}</h2>
<p>${t("templates.policy.section2.content")}</p>

<h2>${t("templates.policy.section3.title")}</h2>
<ul>
  <li>${t("templates.policy.section3.item1")}</li>
  <li>${t("templates.policy.section3.item2")}</li>
  <li>${t("templates.policy.section3.item3")}</li>
</ul>

<h2>${t("templates.policy.section4.title")}</h2>
<p><strong>${t("templates.policy.section4.responsible")}:</strong> [${t("templates.policy.section4.position")}]</p>
<p><strong>${t("templates.policy.section4.responsibilities")}:</strong></p>
<ul>
  <li>${t("templates.policy.section4.item1")}</li>
  <li>${t("templates.policy.section4.item2")}</li>
</ul>

<h2>${t("templates.policy.section5.title")}</h2>
<p>${t("templates.policy.section5.content")}</p>

<h2>${t("templates.policy.section6.title")}</h2>
<p>${t("templates.policy.section6.approved")}: _______________</p>
<p>${t("templates.policy.section6.signature")}: _________________________</p>`,

    procedure: `<h1>${t("templates.procedure.title")}</h1>

<h2>${t("templates.procedure.section1.title")}</h2>
<p>${t("templates.procedure.section1.content")}</p>

<h2>${t("templates.procedure.section2.title")}</h2>
<p>${t("templates.procedure.section2.content")}</p>

<h2>${t("templates.procedure.section3.title")}</h2>
<h3>${t("templates.procedure.section3.subsection1.title")}</h3>
<ol>
  <li>${t("templates.procedure.section3.subsection1.item1")}</li>
  <li>${t("templates.procedure.section3.subsection1.item2")}</li>
  <li>${t("templates.procedure.section3.subsection1.item3")}</li>
</ol>

<h3>${t("templates.procedure.section3.subsection2.title")}</h3>
<ol>
  <li>${t("templates.procedure.section3.subsection2.item1")}</li>
  <li>${t("templates.procedure.section3.subsection2.item2")}</li>
</ol>

<h3>${t("templates.procedure.section3.subsection3.title")}</h3>
<ol>
  <li>${t("templates.procedure.section3.subsection3.item1")}</li>
  <li>${t("templates.procedure.section3.subsection3.item2")}</li>
</ol>

<h2>${t("templates.procedure.section4.title")}</h2>
<p>• ${t("templates.procedure.section4.execution")}: [${t("templates.procedure.section4.namePosition")}]</p>
<p>• ${t("templates.procedure.section4.approval")}: [${t("templates.procedure.section4.namePosition")}]</p>

<h2>${t("templates.procedure.section5.title")}</h2>
<ul>
  <li>${t("templates.procedure.section5.item1")}</li>
  <li>${t("templates.procedure.section5.item2")}</li>
</ul>`,
  };

  return templates[category] || "";
}

