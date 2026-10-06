export type PictureCategory = 'places' | 'work' | 'life';

export interface Picture {
  file: string;
  category: PictureCategory;
  title: string;
  caption: string;
}

export const pictureFilters: { value: 'all' | PictureCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'places', label: 'Places' },
  { value: 'work', label: 'Work' },
  { value: 'life', label: 'Life' },
];

export const pictures: Picture[] = [
  { file: 'nashik-godavari.jpg', category: 'places', title: 'Nashik', caption: 'My home town, on the Godavari' },
  { file: 'limerick-shannon.jpg', category: 'places', title: 'Limerick', caption: "River Shannon and King John's Castle" },
  { file: 'ul-campus.jpg', category: 'places', title: 'University of Limerick', caption: "Where I'm studying this year" },
  { file: 'desk-dotnet.jpg', category: 'work', title: 'My desk', caption: 'C#, .NET and Angular' },
  { file: 'ocr-pipeline.jpg', category: 'work', title: 'OCR pipeline', caption: 'How bank statements become data' },
  { file: 'loan-origination.jpg', category: 'work', title: 'Loan origination flow', caption: 'The five main steps' },
  { file: 'modernisation.jpg', category: 'work', title: 'Legacy modernisation', caption: 'Before and after' },
  { file: 'lexaura.jpg', category: 'work', title: 'LexAura', caption: 'WinTank 2026 prototype' },
  { file: 'music.jpg', category: 'life', title: 'Music', caption: 'How I switch off' },
  { file: 'exploring.jpg', category: 'life', title: 'Exploring', caption: 'Routes still to walk' },
];
