import { CheckIcon } from "@heroicons/react/20/solid";

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function CheckBox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className="text-md relative flex items-center">
      <input
        type="checkbox"
        className="delay-50 form-checkbox peer mx-2 h-5 w-5 appearance-none rounded-md border-2 border-slate-400 bg-slate-400 transition checked:border-indigo-500 checked:bg-indigo-500 hover:border-white"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-white">{label}</span>
      <CheckIcon className="invisible absolute left-2 size-5 text-white peer-checked:visible" />
    </label>
  );
}
