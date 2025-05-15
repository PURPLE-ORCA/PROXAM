<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang; // For translations

class ProfessorAccountActivation extends Notification // optionally implements ShouldQueue
{
    use Queueable;

    /**
     * The password reset token.
     *
     * @var string
     */
    public $token;

    /**
     * The user's email address.
     * (Not strictly needed for the default mail message if User model is passed,
     * but good to have if you customize further or need it for other channels)
     * @var string
     */
    public $email;


    /**
     * Create a new notification instance.
     *
     * @param  string  $token
     * @param  string  $email
     * @return void
     */
    public function __construct($token, $email)
    {
        $this->token = $token;
        $this->email = $email;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable The User model instance
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $activationUrl = url(route('password.reset', [
            'token' => $this->token,
            'email' => $this->email, // Use the email passed to the constructor or $notifiable->getEmailForPasswordReset()
        ], false));

        return (new MailMessage)
            ->subject(Lang::get('Account Activation & Password Setup')) // Customize subject
            ->greeting(Lang::get('Hello :name,', ['name' => $notifiable->name])) // Personalize greeting
            ->line(Lang::get('An account has been created for you on :app_name.', ['app_name' => config('app.name')]))
            ->line(Lang::get('Please click the button below to set your password and activate your account:'))
            ->action(Lang::get('Set Your Password'), $activationUrl)
            ->line(Lang::get('This link will expire in :count minutes.', ['count' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire')]))
            ->line(Lang::get('If you did not expect this account creation, no further action is required.'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            //
        ];
    }
}