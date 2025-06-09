import { getDropdownOptions } from '@/lib/db/dropdown-actions';
import AddProjectForm from '@/components/AddProjectForm';

export default async function AddProjectPage() {
  const submissionYears = (await getDropdownOptions('submission_years')).map(option => parseInt(option.option_value));
  const projectTypes = (await getDropdownOptions('project_types')).map(option => option.option_value);
  const departments = (await getDropdownOptions('departments')).map(option => option.option_value);
  const availableDomains = (await getDropdownOptions('domains')).map(option => option.option_value);

  return (
    <AddProjectForm
      initialSubmissionYears={submissionYears}
      initialProjectTypes={projectTypes}
      initialDepartments={departments}
      initialAvailableDomains={availableDomains}
    />
  );
}
