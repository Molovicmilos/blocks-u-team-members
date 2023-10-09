<?php
/**
 * Plugin Name:       Team members 2
 * Description:       A team members grid
 * Requires PHP:      7.0
 * Author:            Molke
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       team-members
 *
 * @package           blocks-u
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */

add_filter( 'block_categories_all', function($categories) {
		array_unshift($categories, [
		'slug' => 'blocks-u',
		'title' => 'Blocks U'
	]);
return $categories;
} );
function blocks_u_team_members_block_init() {
	register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'blocks_u_team_members_block_init' );
