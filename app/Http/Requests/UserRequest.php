<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use App\Models\User;

class UserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($this->route()->parameter('user'))],
            'role' => ['required', Rule::in(['admin', 'rh', 'professeur', 'chef_service'])],
        ];

        if ($this->isMethod('post')) { // For store method
            $rules['password'] = ['required', 'confirmed', Password::defaults()];
        } elseif ($this->isMethod('put') && $this->input('password')) { // For update method, if password is provided
            $rules['password'] = ['confirmed', Password::defaults()];
        }

        return $rules;
    }
}
