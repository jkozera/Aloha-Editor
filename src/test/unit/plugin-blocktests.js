/*!
 * This file is part of Aloha Editor
 * Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
 * Licensed unter the terms of http://www.aloha-editor.com/license.html
 */

/**
 * TODOs:
 * - selectRow/selectColumn should take into account the helper row/column.
 *   ie: selectRow(0) and selectColumn(0), should be zero indexed
 */

define(
[ 'testutils', '../../lib/aloha/jquery', 'htmlbeautifier' ],
function( TestUtils) {
	'use strict';

	Aloha.ready(function() {

		var jQuery = Aloha.jQuery,
		    testContainer = jQuery( '#block-outer-container' ),
			testcase,
			BlockManager;

		var tests = [
			{
				always: true,
				async: true,
				desc: 'Aloha Dependency Loader',
				assertions: 1,
				operation: function() {
					var timeout = setTimeout(function() {
						ok(false, 'Aloha was not initialized within 10 seconds. Aborting!');
						start();
					}, 10000);
					// All other tests are done when Aloha is ready
					Aloha.require( ['block/blockmanager'],
							function ( AlohaBlockManager ) {
						BlockManager = AlohaBlockManager;
						clearTimeout(timeout);
						ok(true, 'Alohoha Dependencies were loaded');
						start();
					});
				}
			},

			{ module : 'Initialization' },
			///////////////////////////////////////////////////////////////////////

			{
				desc      : 'A default block is initialized correctly',
				start     : '<div id="myDefaultBlock">Some default block content</div>',
				assertions: 8,
				operation : function(testContainer, testcase) {
					jQuery('#myDefaultBlock').alohaBlock({
						'aloha-block-type': 'DefaultBlock'
					});
					var $block = jQuery('.aloha-block', testContainer);

					// Block Wrapper assertions
					strictEqual($block.attr('contenteditable'), 'false', 'The block div is contenteditable=false.');
					ok($block.hasClass('aloha-block'), 'The block div has the aloha-block CSS class.');
					ok($block.hasClass('aloha-block-DefaultBlock'), 'The block div has the aloha-block-DefaultBlock CSS class.');
					strictEqual($block.attr('data-aloha-block-type'), 'DefaultBlock', 'The block div wrapper has the data-aloha-block-type set correctly.');
					equal($block.attr('data-block-type'), undefined, 'The block div wrapper does not have data-block-type set, as it shall not be used anymore by the framework.');

					// content wrapper assertions
					ok($block.is('#myDefaultBlock'), 'The given ID is re-used.');
					ok($block.find('.aloha-block-handle'), 'The handles are added.');
					ok($block.html().match(/Some default block content/), 'The block content is still there.');
				}
			},

			{
				desc      : 'Data attributes from inside the element are available through the attr() notation',
				start     : '<div id="myDefaultBlock" data-foo="Bar" data-somePropertyWithUppercase="test2">Some default block content2</div>',
				assertions: 2,
				operation : function(testContainer, testcase) {
					jQuery('#myDefaultBlock').alohaBlock({
						'aloha-block-type': 'DefaultBlock'
					});
					var block = BlockManager.getBlock(jQuery('#myDefaultBlock', testContainer));
					strictEqual(block.attr('foo'), 'Bar');
					strictEqual(block.attr('somepropertywithuppercase'), 'test2', 'Uppercase properties need to be converted to lowercase.');
				}
			},

			{
				exclude: true, // TODO: FIX LATER
				desc      : 'Inline JavaScript is only executed once, and not executed while blockifying an element',
				setup     : function(testContainer) {
					window.thisTestExecutionCount = 0;
					testContainer[0].innerHTML = '<div id="myDefaultBlock">Some default block contesnt<script type="text/javascript">window.thisTestExecutionCount++;</script></div>';
				},
				assertions: 1,
				operation : function(testContainer, testcase) {
					jQuery('#myDefaultBlock').alohaBlock({
						'aloha-block-type': 'DefaultBlock'
					});

					console.log(testContainer);
					strictEqual(window.thisTestExecutionCount, 0);
					delete window.thisTestExecutionCount;
				}
			},

			{
				desc      : 'Attached event handlers are not removed',
				start     : '<div id="myDefaultBlock" data-foo="Bar" data-somePropertyWithUppercase="test2">Some default block content2</div>',
				assertions: 1,
				operation : function(testContainer, testcase) {
					jQuery('#myDefaultBlock').click(function() {
						ok(true);
					})
					jQuery('#myDefaultBlock').alohaBlock({
						'aloha-block-type': 'DefaultBlock'
					});
					jQuery('#myDefaultBlock').click();
				}
			},

			{
				desc      : 'Trying to create a block from an element which is no div or span throws error',
				start     : '<img id="myDefaultBlock" />',
				assertions: 1,
				operation : function(testContainer, testcase) {
					jQuery('#myDefaultBlock').alohaBlock({
						'aloha-block-type': 'DefaultBlock'
					});

					strictEqual(jQuery('.aloha-block', testContainer).length, 0, 'Image object has been blockified, although this should not happen.');
				}
			},

			{ module : 'Block API' },
			///////////////////////////////////////////////////////////////////////
			{
				exclude   : false,
				desc      : 'fetching attr() with uppercase key is the same as with lowercase key',
				start     : '<div id="myDefaultBlock" data-foo="Bar">Some default block content</div>',
				//assertions: 1,
				operation : function(testContainer, testcase) {
					jQuery('#myDefaultBlock').alohaBlock({
						'aloha-block-type': 'DefaultBlock'
					});
					var block = BlockManager.getBlock(jQuery('#myDefaultBlock', testContainer));

					strictEqual(block.attr('foo'), 'Bar');
					strictEqual(block.attr('FoO'), 'Bar');
				}
			},

			{
				exclude   : false,
				desc      : 'setting attr() with uppercase key is the same as with lowercase key',
				start     : '<div id="myDefaultBlock" data-foo="Bar">Some default block content</div>',
				assertions: 1,
				operation : function(testContainer, testcase) {
					jQuery('#myDefaultBlock').alohaBlock({
						'aloha-block-type': 'DefaultBlock'
					});
					var block = BlockManager.getBlock(jQuery('#myDefaultBlock', testContainer));
					block.attr('test', 'mytest1');
					block.attr('TeSt', 'mytest2');

					strictEqual(block.attr('test'), 'mytest2');
				}
			},

			{
				exclude   : false,
				desc      : 'setting a key with attr() which starts with "aloha-block-" throws an error and does not save the key',
				start     : '<div id="myDefaultBlock" data-foo="Bar">Some default block content</div>',
				assertions: 2,
				operation : function(testContainer, testcase) {
					jQuery('#myDefaultBlock').alohaBlock({
						'aloha-block-type': 'DefaultBlock'
					});
					var block = BlockManager.getBlock(jQuery('#myDefaultBlock', testContainer));
					block.attr('aloha-block-test1', 'foo');
					strictEqual(block.attr('aloha-block-test1'), undefined);

					block.attr('aloha-block-type', 'foo');
					strictEqual(block.attr('aloha-block-type'), 'DefaultBlock');
				}
			},

			{
				exclude   : false,
				desc      : 'Selection handling works with non-nested blocks',
				start     : '<div id="block1">Some default block content</div> <div id="block2">Some default block content</div>',
				assertions: 8,
				operation : function(testContainer, testcase) {
					jQuery('#block1').alohaBlock({
						'aloha-block-type': 'DefaultBlock'
					});
					jQuery('#block2').alohaBlock({
						'aloha-block-type': 'DefaultBlock'
					});

					var block1 = BlockManager.getBlock(jQuery('#block1', testContainer));
					var block2 = BlockManager.getBlock(jQuery('#block2', testContainer));

					ok(!block1.isActive(), 'block 1 is not active');
					ok(!block2.isActive(), 'block 2 is not active');

					block1.activate();
					ok(true, '--> activated block1');

					ok(block1.isActive(), 'block 1 is active after activating it');
					ok(!block2.isActive(), 'block 2 is not active after activating block1');

					block2.activate();
					ok(true, '--> activated block2');

					ok(!block1.isActive(), 'block1 has been deactivated after activating block2');
					ok(block2.isActive(), 'block 2 is active after activating it');
				}
			},

			{ module : 'BlockManager API' },
			///////////////////////////////////////////////////////////////////////

			{
				exclude   : false,
				desc      : 'getBlock returns block when passed the block ID, the inner or outer DOM element',
				start     : '<div id="myDefaultBlock">Some default block content</div>',
				assertions: 3,
				operation : function(testContainer, testcase) {
					jQuery('#myDefaultBlock').alohaBlock({
						'aloha-block-type': 'DefaultBlock'
					});

					var block1 = BlockManager.getBlock(jQuery('.aloha-block', testContainer).attr('id'));
					var block2 = BlockManager.getBlock(jQuery('.aloha-block', testContainer));
					var block3 = BlockManager.getBlock(jQuery('#myDefaultBlock', testContainer));
					// Check that the returned objects are always the same
					ok(block1 === block2);
					ok(block2 === block3);
					strictEqual(typeof block1, 'object', 'Blocks were no objects');
				}
			},
			{
				exclude   : false,
				desc      : 'getBlock returns undefined when passed a wrong ID',
				start     : '<div id="myDefaultBlock">Some default block content</div>',
				assertions: 1,
				operation : function(testContainer, testcase) {
					jQuery('#myDefaultBlock').alohaBlock({
						'aloha-block-type': 'DefaultBlock'
					});

					strictEqual(undefined, BlockManager.getBlock('someUndefinedId'));
				}
			},
			{ exclude : true } // ... just catch trailing commas
		];

		var runOnlyTestId = null;
		for(var i=0; i<tests.length; i++) {
			if (tests[i].only === true) {
				runOnlyTestId = i;
			}
		}

		jQuery.each(tests, function(i, testcase) {
			if (runOnlyTestId !== null && runOnlyTestId !== i && !testcase.always) return;
			if (testcase.exclude === true) {
				return;
			}

			if (testcase.module) {
				module( testcase.module.toUpperCase() + ' :' );
				return;
			}

			test(
				(testcase.desc || 'Test').toUpperCase(),
				testcase.assertions,
				function() {
					if (testcase.setup) {
						testcase.setup(testContainer);
					} else {
						testContainer.html(testcase.start);
					}

					if (testcase.async === true){
						stop();
					}

					if (typeof testcase.operation === 'function') {
						testcase.operation(testContainer, testcase);
					}

				}
			);
		});
	});
});
