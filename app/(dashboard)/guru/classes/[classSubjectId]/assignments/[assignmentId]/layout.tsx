// Assignment grading view hosts a parallel `@modal` slot so a submission preview
// can open over the grading list without changing the underlying page.
export default function AssignmentGradingLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
